// OKUNAMI partner dashboard backend (okunami.pro/socio). verify_jwt off: it signs its own sessions.
//
// Public:
//   POST { action: 'refer', reseller, via, lang, lead:{ full_name, phone, email, business_type } } -> { id, code }
//        A referral from another card (for now: Mayra Soto Burgos's card, via 'mayra-card').
//        Saved to fc_reseller_leads under that reseller and emailed to Angel and the reseller.
// Signed in (PIN):
//   POST { action: 'login', pin }                       -> { token, who, admin }
//   POST { action: 'list', token, reseller? }            -> { who, admin, reseller, resellers, leads, totals, card }
//   POST { action: 'add', token, lead:{...} }            -> { lead }      someone the partner talked to (source 'manual')
//   POST { action: 'update', token, id, status?, follow_up?, partner_notes?, contacted?,
//          admin only: amount?, design?, plan?, plan_payments?, pay_commission? }  -> { lead }
//   POST { action: 'bonus_paid', token, reseller, month:'YYYY-MM' }  (admin)  -> { ok }
//
// Who: a reseller slug (hiram-diaz) sees only their own leads. 'admin' sees every reseller (picker), and can
// mark Zelle / Apple Cash payments as paid, and record commission payouts.
// Commission rules live in logic.ts (TERMS): 25% design, 40% of the first 12 months of the plan, $100 bonus at 10+ clients a month. Nothing on a reseller's screen shows that the admin can view it.
// PINs live hashed in fc_partner_access (set them with: select public.fc_set_partner_pin('hiram-diaz', '1234');).
import { admin, cors, json } from '../_shared/okunami.ts';
import { PARTNERS, VIA, PARTNER_STATUSES, ADMIN_STATUSES, clip, earning, makeToken, readToken, totals } from './logic.ts';

/* ---------- alerts (email; never throws) ---------- */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
async function email(to: string[], subject: string, lines: string[]) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key || !to.length) return;
  const from = Deno.env.get('OKUNAMI_ALERT_FROM') ?? Deno.env.get('OKUNAMI_WELCOME_FROM') ?? 'OKUNAMI <hello@okunami.pro>';
  await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, reply_to: 'angel@finessemedia.pro', subject, text: lines.join('\n'),
      html: `<div style="max-width:560px;margin:0 auto;padding:24px 18px;font:15px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0B0E2A">${lines.map((l) => `<p style="margin:0 0 10px">${esc(l)}</p>`).join('')}</div>` }),
  }).catch((e) => console.error('partner email failed', e));
}

/* ---------- login rate limit (per IP, in memory) ---------- */
const tries = new Map<string, number[]>();
function tooMany(ip: string, max = 6, ms = 15 * 60_000) {
  const now = Date.now(), list = (tries.get(ip) ?? []).filter((t) => now - t < ms);
  list.push(now); tries.set(ip, list);
  return list.length > max;
}

const LEAD_COLS = 'id, created_at, updated_at, reseller, lang, source, full_name, business_name, business_type, phone, email, plan, billing, seats, studio, studio_cents, payment_method, status, amount_cents, fee_cents, notes, follow_up, last_contact, partner_notes, paid_at, plan_payments, commission_paid_cents, commission_paid_at';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'anon';
  try {
    const b = await req.json().catch(() => ({})) as Record<string, unknown>;
    const db = admin();

    /* ----- public: referral from another card ----- */
    if (b.action === 'refer') {
      if (tooMany('refer:' + ip, 8, 60 * 60_000)) return json({ error: 'busy' }, 429);
      const reseller = clip(b.reseller, 60), via = clip(b.via, 40);
      if (!PARTNERS[reseller] || !VIA[via]) return json({ error: 'bad_request' }, 400);
      const l = (b.lead ?? {}) as Record<string, unknown>;
      let phone = String(l.phone ?? '').replace(/\D/g, '');
      if (phone.length === 10) phone = '1' + phone;
      const mail = clip(l.email, 120).toLowerCase();
      const fields = { full_name: clip(l.full_name, 80), business_type: clip(l.business_type, 120) || null, phone: phone ? '+' + phone : null, email: mail || null };
      if (!fields.full_name || phone.length < 11 || phone.length > 15) return json({ error: 'need_name_phone' }, 400);
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return json({ error: 'need_email' }, 400);
      const lang = b.lang === 'en' ? 'en' : 'es';
      const { data, error } = await db.from('fc_reseller_leads').insert({ reseller, lang, source: via, status: 'new', ...fields }).select('id').single();
      if (error) throw error;
      const code = `${VIA[via].prefix}-${String(data.id).slice(0, 6).toUpperCase()}`;
      const p = PARTNERS[reseller];
      await email([Deno.env.get('OKUNAMI_ALERT_EMAIL') ?? 'angel@finessemedia.pro', p.email],
        `Nuevo referido ${code}: ${fields.full_name} (${VIA[via].label})`,
        [`Nuevo referido de ${p.name} desde ${VIA[via].label}.`, `Código: ${code}`, `Nombre: ${fields.full_name}`,
         `Negocio: ${fields.business_type ?? '-'}`, `WhatsApp: ${fields.phone}`, `Email: ${fields.email ?? '-'}`,
         'Lo ven en el panel: https://okunami.pro/socio/']);
      return json({ id: data.id, code });
    }

    /* ----- sign in ----- */
    if (b.action === 'login') {
      if (tooMany('login:' + ip)) return json({ error: 'locked' }, 429);
      const { data } = await db.rpc('fc_partner_login', { p_pin: clip(b.pin, 64) });
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.who) return json({ error: 'wrong_pin' }, 401);
      return json({ token: makeToken(row.who, row.pin_hash), who: row.who, admin: row.who === 'admin' });
    }

    /* ----- everything else needs a session ----- */
    const { data: access } = await db.from('fc_partner_access').select('who, pin_hash, commission_rate');
    const rows = (access ?? []) as { who: string; pin_hash: string; commission_rate: number }[];
    const who = readToken(clip(b.token, 400), (w) => rows.find((r) => r.who === w)?.pin_hash ?? null);
    if (!who) return json({ error: 'auth' }, 401);
    const isAdmin = who === 'admin';
    const resellers = isAdmin ? Object.keys(PARTNERS) : [who];
    const reseller = isAdmin ? (PARTNERS[clip(b.reseller, 60)] ? clip(b.reseller, 60) : resellers[0]) : who;
    if (!PARTNERS[reseller]) return json({ error: 'auth' }, 401);

    if (b.action === 'list') {
      const { data, error } = await db.from('fc_reseller_leads').select(LEAD_COLS).eq('reseller', reseller).neq('source', 'test').order('created_at', { ascending: false }).limit(1000);
      if (error) throw error;
      const { data: bp } = await db.from('fc_partner_bonus').select('month').eq('reseller', reseller);
      const leads = (data ?? []).map((l: Record<string, unknown>) => ({ ...l, earning: earning(l) }));
      return json({ who, admin: isAdmin, reseller, resellers: resellers.map((r) => ({ id: r, name: PARTNERS[r].name })), card: PARTNERS[reseller].card,
        leads, totals: totals(data ?? [], ((bp ?? []) as { month: string }[]).map((b) => b.month)) });
    }

    if (b.action === 'bonus_paid') {
      if (!isAdmin) return json({ error: 'auth' }, 403);
      const month = clip(b.month, 7);
      if (!/^\d{4}-\d{2}$/.test(month)) return json({ error: 'bad_request' }, 400);
      const { error } = await db.from('fc_partner_bonus').upsert({ reseller, month, paid_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true });
    }

    if (b.action === 'add') {
      const l = (b.lead ?? {}) as Record<string, unknown>;
      const fields = {
        full_name: clip(l.full_name, 80), business_name: clip(l.business_name, 120) || null, business_type: clip(l.business_type, 120) || null,
        phone: clip(l.phone, 30) || null, email: clip(l.email, 120).toLowerCase() || null,
        partner_notes: clip(l.partner_notes, 2000) || null, follow_up: /^\d{4}-\d{2}-\d{2}$/.test(String(l.follow_up ?? '')) ? l.follow_up : null,
      };
      if (!fields.full_name) return json({ error: 'need_name' }, 400);
      const { data, error } = await db.from('fc_reseller_leads').insert({ reseller, lang: l.lang === 'en' ? 'en' : 'es', source: 'manual', status: 'contacted', last_contact: new Date().toISOString(), ...fields }).select(LEAD_COLS).single();
      if (error) throw error;
      return json({ lead: data });
    }

    if (b.action === 'update') {
      const id = clip(b.id, 60);
      const { data: lead } = await db.from('fc_reseller_leads').select(LEAD_COLS).eq('id', id).maybeSingle();
      if (!lead || lead.reseller !== reseller) return json({ error: 'not_found' }, 404);
      const upd: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (typeof b.status === 'string') {
        const allowed = isAdmin ? ADMIN_STATUSES : PARTNER_STATUSES;
        if (!allowed.includes(b.status)) return json({ error: 'status_not_allowed' }, 403);
        if (lead.status === 'paid' && !isAdmin) return json({ error: 'status_not_allowed' }, 403);   // only Angel undoes a sale
        upd.status = b.status;
      }
      const cents = (v: unknown) => Math.max(0, Math.min(10_000_000, Math.round(Number(v) * 100) || 0));
      if (isAdmin && b.amount != null) upd.amount_cents = cents(b.amount);
      if (isAdmin && (b.design != null || b.plan != null)) {     // the sale split: design (one time) + one plan payment
        const design = b.design != null ? cents(b.design) : Number(lead.studio_cents) || 0;
        const plan = b.plan != null ? cents(b.plan) : Math.max(0, (Number(lead.amount_cents) || 0) - (Number(lead.studio_cents) || 0));
        upd.studio_cents = design || null; upd.studio = design > 0; upd.amount_cents = design + plan;
      }
      if (isAdmin && b.plan_payments != null) upd.plan_payments = Math.max(1, Math.min(60, Math.round(Number(b.plan_payments)) || 1));
      if ((upd.status === 'paid' || ('amount_cents' in upd && lead.status === 'paid')) && !(Number(upd.amount_cents ?? lead.amount_cents) > 0)) return json({ error: 'need_amount' }, 400);
      if ('follow_up' in b) upd.follow_up = /^\d{4}-\d{2}-\d{2}$/.test(String(b.follow_up ?? '')) ? b.follow_up : null;
      if ('partner_notes' in b) upd.partner_notes = clip(b.partner_notes, 2000) || null;
      if (b.contacted === true) upd.last_contact = new Date().toISOString();
      if (isAdmin && b.pay_commission === true) {                 // pays out everything owed on this sale (or settles a refund)
        const e = earning({ ...lead, ...upd });
        upd.commission_paid_cents = e.cleared ? e.earned : 0; upd.commission_paid_at = new Date().toISOString();
      }
      const { data, error } = await db.from('fc_reseller_leads').update(upd).eq('id', id).select(LEAD_COLS).single();
      if (error) throw error;
      return json({ lead: { ...data, earning: earning(data) } });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (e) {
    console.error('okunami-partner', e);
    return json({ error: 'server' }, 500);
  }
});
