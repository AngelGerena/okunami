// okunami-domain: connect a domain the client already owns to their card (Pro Plus and Business).
//
// POST { action: 'request', cardId, domain, method: 'diy' | 'hookup' | 'register', provider?, phone? }
//   diy       free. Saves the domain and returns the record to add.            -> { status, target }
//   hookup    $39 one time (free on a yearly plan). Angel connects it.          -> { url } (Stripe) or { status }
//   register  $49 one time, plus the domain itself. Angel registers + connects. -> { url } (Stripe)
// POST { action: 'check', cardId }  ->  { status, check }   (looks up the record and the https certificate)
//
// Prices are fixed here; the browser never sends an amount. Paid requests finish in okunami-stripe-webhook.
import { admin, cors, currentUser, json, siteUrl, stripe } from '../_shared/okunami.ts';
import { addToNetlify, checkDomain, cleanDomain, DOMAIN_TARGET, providerName } from '../_shared/domains.ts';
import { alertAngel } from '../_shared/notify.ts';

export const HOOKUP_CENTS = 3900;
export const REGISTER_CENTS = 4900;
const METHODS = ['diy', 'hookup', 'register'] as const;
type Method = typeof METHODS[number];
const PROVIDERS = ['godaddy', 'spaceship', 'namecheap', 'squarespace', 'wix', 'cloudflare', 'google', 'other', 'unknown'];

const label = (m: Method) => (m === 'hookup' ? 'Domain Hookup' : m === 'register' ? 'Domain registration + hookup' : 'Do-it-yourself domain');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  try {
    const user = await currentUser(req);
    if (!user) return json({ error: 'Please sign in first.' }, 401);
    const body = await req.json().catch(() => ({}));
    const db = admin();

    /* ------------------------------------------------------------ admin: check any domain from the admin portal */
    if (body.action === 'admin_check') {
      const { data: isAdmin } = await db.from('fc_admins').select('user_id').eq('user_id', user.id).maybeSingle();
      if (!isAdmin) return json({ error: 'Admins only.' }, 403);
      const { data: row } = await db.from('fc_card_domains').select('*').eq('id', String(body.domainId ?? '')).maybeSingle();
      if (!row) return json({ error: 'Not found.' }, 404);
      const check = await checkDomain(row.domain);
      const status = check.record && check.https ? 'connected' : check.record ? 'checking_ssl' : row.status === 'connected' ? 'waiting_dns' : row.status;
      if (check.record && !check.https) await addToNetlify(row.domain).catch(() => 'failed');
      await db.from('fc_card_domains').update({ status, last_check: check, last_checked_at: check.at, updated_at: new Date().toISOString(), ...(status === 'connected' && !row.connected_at ? { connected_at: check.at } : {}) }).eq('id', row.id);
      return json({ status, check });
    }

    const { data: card } = await db.from('fc_cards').select('id, slug, data, published').eq('id', String(body.cardId ?? '')).eq('owner_id', user.id).maybeSingle();
    if (!card) return json({ error: 'Card not found.' }, 404);
    const { data: profile } = await db.from('fc_profiles').select('plan, plan_interval, stripe_customer_id, email, full_name').eq('id', user.id).maybeSingle();
    if (!['plus', 'team'].includes(profile?.plan ?? '')) return json({ error: 'Your own domain comes with Pro Plus and Business.' }, 403);

    const d = (card.data ?? {}) as Record<string, string>;
    const who = d.business || d.fullName || profile?.full_name || user.email || 'A client';

    /* ------------------------------------------------------------ check */
    if (body.action === 'check') {
      const { data: row } = await db.from('fc_card_domains').select('*').eq('card_id', card.id).neq('status', 'canceled').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!row) return json({ status: 'none' });
      if (row.status === 'pending_payment') return json({ status: row.status, domain: row.domain });
      const check = await checkDomain(row.domain);
      const status = check.record && check.https ? 'connected' : check.record ? 'checking_ssl' : row.status === 'requested' ? 'requested' : 'waiting_dns';
      const patch: Record<string, unknown> = { status, last_check: check, last_checked_at: check.at, updated_at: new Date().toISOString() };
      if (status === 'connected' && !row.connected_at) patch.connected_at = check.at;
      // Record found but no certificate yet: make sure Netlify knows the domain (no-op without a token).
      if (check.record && !check.https) await addToNetlify(row.domain).catch(() => 'failed');
      await db.from('fc_card_domains').update(patch).eq('id', row.id);
      if (status === 'connected' && !row.connected_at) {
        await alertAngel({
          subject: `Domain connected: ${row.domain}`,
          lines: [`${who}'s card is now live at https://${row.domain}.`],
          link: { href: `https://${row.domain}`, label: 'Open the card' },
        });
      }
      return json({ status, domain: row.domain, check });
    }

    /* ------------------------------------------------------------ request */
    if (body.action !== 'request') return json({ error: 'Unknown action.' }, 400);
    const method: Method = METHODS.includes(body.method) ? body.method : 'diy';
    const domain = cleanDomain(body.domain);
    if (!domain) return json({ error: 'Enter a domain like vcard.yourbusiness.com.' }, 400);
    const provider = PROVIDERS.includes(String(body.provider)) ? String(body.provider) : 'unknown';
    const phone = String(body.phone ?? '').replace(/[^\d+()\-\s.]/g, '').slice(0, 30) || null;

    // The domain may not already belong to someone else's card.
    const { data: taken } = await db.from('fc_card_domains').select('id, card_id').eq('domain', domain).neq('status', 'canceled').maybeSingle();
    if (taken && taken.card_id !== card.id) return json({ error: 'That domain is already connected to another card.' }, 409);

    const yearly = profile?.plan_interval === 'year';
    const cents = method === 'register' ? REGISTER_CENTS : method === 'hookup' ? (yearly ? 0 : HOOKUP_CENTS) : 0;
    const status = cents > 0 ? 'pending_payment' : method === 'diy' ? 'waiting_dns' : 'requested';

    // One live domain per card: retire the old one, then save the new request.
    await db.from('fc_card_domains').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('card_id', card.id).neq('status', 'canceled');
    const { data: row, error } = await db.from('fc_card_domains').insert({
      card_id: card.id, owner_id: user.id, domain, method, provider, contact_phone: phone, status, paid_cents: 0,
    }).select('id').single();
    if (error) throw error;

    const adminLink = { href: `${siteUrl()}/app/admin?tab=domains`, label: 'Open Domain Hookups' };
    const wa = { 1: who, 2: domain, 3: providerName(provider), 4: phone ?? user.email ?? '-', 5: `${siteUrl()}/app/admin?tab=domains` };

    if (cents > 0) {
      const s = stripe();
      let customer = profile?.stripe_customer_id as string | null;
      if (!customer) {
        const c = await s.customers.create({ email: user.email ?? undefined, metadata: { okunami_user_id: user.id } });
        customer = c.id;
        await db.from('fc_profiles').update({ stripe_customer_id: customer }).eq('id', user.id);
      }
      const back = `${siteUrl()}/app/cards/${card.id}`;
      const session = await s.checkout.sessions.create({
        mode: 'payment',
        customer,
        client_reference_id: user.id,
        line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: cents, product_data: { name: method === 'register' ? 'OKUNAMI Domain registration + hookup' : 'OKUNAMI Domain Hookup', description: domain } } }],
        metadata: { okunami_kind: 'domain', okunami_domain_id: row.id, okunami_user_id: user.id },
        payment_intent_data: { metadata: { okunami_kind: 'domain', okunami_domain_id: row.id } },
        success_url: `${back}?domain=paid`,
        cancel_url: `${back}?domain=canceled`,
      });
      await db.from('fc_card_domains').update({ stripe_session_id: session.id }).eq('id', row.id);
      return json({ url: session.url });
    }

    if (method === 'diy') {
      const netlify = await addToNetlify(domain).catch(() => 'failed' as const);
      if (netlify !== 'added' && netlify !== 'already') {
        // Without a Netlify token the domain still has to be added to the site once, by hand.
        await alertAngel({
          subject: `Add ${domain} in Netlify (do-it-yourself domain)`,
          lines: [`${who} is connecting ${domain} on their own.`, `Add it in Netlify: okunami > Domain management > Add a domain alias, so it gets a certificate.`],
          link: adminLink,
          wa,
        });
      }
      return json({ status, domain, target: DOMAIN_TARGET });
    }

    // Free Domain Hookup on a yearly plan.
    await alertAngel({
      subject: `New ${label(method)}: ${who}`,
      lines: [`${who} wants ${domain} connected (free, yearly plan).`, `Where they bought it: ${providerName(provider)}.`, `Reach them at ${phone ?? user.email ?? 'no contact given'}.`],
      link: adminLink,
      wa,
    });
    return json({ status, domain, target: DOMAIN_TARGET });
  } catch (e) {
    console.error('okunami-domain', e);
    return json({ error: e instanceof Error ? e.message : 'Something went wrong.' }, 500);
  }
});
