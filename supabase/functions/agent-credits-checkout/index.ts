// POST { account_id, pack_id }  ->  { url }   (signed-in owner only)
// Starts a ONE-TIME Stripe Checkout for a credit pack. Pack price and credits come from ag_settings.packs, never from the browser.
import { admin, cors, currentUser, json, siteUrl, stripe } from '../_shared/okunami.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  try {
    const user = await currentUser(req);
    if (!user) return json({ error: 'Please sign in first.' }, 401);
    const body = await req.json().catch(() => ({}));
    const db = admin();

    const { data: acct } = await db.from('ag_accounts').select('id, name, owner_id').eq('id', String(body.account_id ?? '')).maybeSingle();
    if (!acct || acct.owner_id !== user.id) return json({ error: 'Account not found.' }, 404);

    const { data: row } = await db.from('ag_settings').select('value').eq('key', 'packs').maybeSingle();
    const pack = ((row?.value ?? []) as any[]).find((p) => p.id === body.pack_id);
    if (!pack || !(pack.price_cents >= 100) || !(pack.credits_usd > 0)) return json({ error: 'That pack is not available.' }, 400);

    const creditsMicros = Math.round(pack.credits_usd * 1_000_000);
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: pack.price_cents, product_data: { name: `OKUNAMI agent credits: ${pack.name}` } } }],
      metadata: { kind: 'agent_credits', ag_account_id: acct.id, ag_pack_id: pack.id, credits_micros: String(creditsMicros) },
      success_url: `${siteUrl()}/app?credits=ok`,
      cancel_url: `${siteUrl()}/app?credits=cancelled`,
    });
    return json({ url: session.url });
  } catch (e) {
    console.error('agent-credits-checkout', e);
    return json({ error: 'Could not start checkout. Please try again.' }, 500);
  }
});
