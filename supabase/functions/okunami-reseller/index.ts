// OKUNAMI reseller card backend (Hiram Diaz and future resellers).
// One public endpoint, verify_jwt off; it guards itself with input limits, a per-IP rate limit and server-side prices.
//
// POST { action: 'health' }                                   -> { ai: boolean }
// POST { action: 'agent', lang, reseller, messages:[{role,content}], lead_id? } -> { reply, lead_id, designs?, lead? (ready to pay) }
// POST { action: 'save', reseller, lang, lead:{...} }          -> { lead }            (scripted fallback, no AI)
// POST { action: 'pay', id, method:'card'|'klarna'|'zelle'|'applecash', plan, billing, seats, returnUrl } -> { url? , ok }
//      klarna: yearly plans only, without a custom design (Klarna Pay in 4 does not mix a subscription with a one-time charge)
// POST { action: 'confirm', id, session }                     -> { paid }
// POST { action: 'lead', id?, lead:{...} }                    -> { id }              (scripted: save as soon as there is a name and phone)
// POST { action: 'details', id, details:{...} }               -> { ok }              (after payment: address, hours, what goes on the card)
// POST { action: 'later', id, returnUrl }                     -> { ok, emailed }      (email the person a link back to their checkout)
// POST { action: 'resume', id }                               -> { lead }            (reopen a saved enrollment from that link)
//
// Secrets: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (already set for OKUNAMI)
//          ANTHROPIC_API_KEY (needed for the AI agents; without it the card runs its scripted flow)
//          optional: OKUNAMI_AGENT_MODEL, RESEND_API_KEY, OKUNAMI_ALERT_EMAIL, OKUNAMI_ALERT_FROM
import { admin, clampSeats, cors, json, stripe, CENTS, lineItemFor, type Interval, type Plan } from './_shared/okunami.ts';
import { RESELLERS, systemPrompt } from './prompts.ts';

/* ---------- limits ---------- */
const hits = new Map<string, number[]>();
function limited(ip: string, max = 40, windowMs = 10 * 60_000) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > max;
}
const clip = (v: unknown, n = 400) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/* ---------- fee: pass Stripe's 2.9% + 30c on to the buyer so the full price lands ---------- */
export function feeFor(cents: number): number {
  return Math.ceil((cents + 30) / (1 - 0.029)) - cents;
}
/** Klarna costs 5.99% + 30c; the buyer covers it the same way. */
export function klarnaFeeFor(cents: number): number {
  return Math.ceil((cents + 30) / (1 - 0.0599)) - cents;
}
const KLARNA_MAX = 200000;   // Klarna Pay in 4 tops out at $2,000
function planCents(plan: Plan, billing: Interval, seats: number) {
  return CENTS[plan][billing] * (plan === 'team' ? clampSeats(seats) : 1);
}

/* ---------- lead fields ---------- */
const FIELDS = ['full_name', 'business_name', 'business_type', 'address', 'phone', 'email', 'hours', 'pain_points', 'wants', 'suggestions'] as const;
function cleanLead(raw: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of FIELDS) out[f] = clip(raw[f], f === 'pain_points' || f === 'wants' || f === 'suggestions' ? 1200 : 200) || null;
  const plan = raw.plan === 'team' || raw.plan === 'plus' || raw.plan === 'pro' ? raw.plan : null;
  out.plan = plan;
  out.billing = raw.billing === 'year' ? 'year' : raw.billing === 'month' ? 'month' : null;
  out.seats = plan === 'team' ? clampSeats(raw.seats) : null;
  out.studio = raw.studio === true || raw.studio === 'true';
  return out;
}

/* ---------- alerts (email only; never throws) ---------- */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
async function alert(to: string[], subject: string, lines: string[]) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key || !to.length) return;
  const from = Deno.env.get('OKUNAMI_ALERT_FROM') ?? Deno.env.get('OKUNAMI_WELCOME_FROM') ?? 'OKUNAMI <hello@okunami.pro>';
  const html = `<div style="max-width:560px;margin:0 auto;padding:24px 18px;font:15px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#141A33">${lines.map((l) => `<p style="margin:0 0 10px">${esc(l)}</p>`).join('')}</div>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, text: lines.join('\n'), html }),
  }).catch((e) => console.error('alert failed', e));
}
function leadLines(l: Record<string, unknown>) {
  const plan = l.plan ? `${l.plan === 'team' ? 'Business' : l.plan === 'plus' ? 'Pro Plus' : 'Pro'} ${l.billing === 'year' ? 'yearly' : 'monthly'}${l.plan === 'team' ? `, ${l.seats} cards` : ''}` : 'not chosen yet';
  return [
    `Name: ${l.full_name ?? '-'}`, `Business: ${l.business_name ?? '-'} (${l.business_type ?? '-'})`,
    `Phone: ${l.phone ?? '-'}`, `Email: ${l.email ?? '-'}`, `Address: ${l.address ?? '-'}`, `Hours: ${l.hours ?? '-'}`,
    `Pain points: ${l.pain_points ?? '-'}`, `Wants on the card: ${l.wants ?? '-'}`, `Suggested: ${l.suggestions ?? '-'}`,
    `Plan: ${plan}`,
    `Custom design: ${l.studio ? (l.studio_cents ? `yes, $${(Number(l.studio_cents) / 100).toFixed(2)}` : 'yes') : 'no'}`,
    `Language: ${l.lang === 'es' ? 'Spanish' : 'English'}`,
  ];
}
function recipients(reseller: string) {
  const angel = Deno.env.get('OKUNAMI_ALERT_EMAIL') ?? 'angel@finessemedia.pro';
  const r = RESELLERS[reseller];
  return [angel, ...(r?.email ? [r.email] : [])];
}

async function insertLead(reseller: string, lang: string, source: string, fields: Record<string, unknown>) {
  const db = admin();
  const { data, error } = await db.from('fc_reseller_leads').insert({ reseller, lang, source, ...fields }).select('id').single();
  if (error) throw error;
  const r = RESELLERS[reseller];
  await alert(recipients(reseller), `New OKUNAMI enrollment via ${r?.name ?? reseller}: ${fields.business_name ?? fields.full_name ?? 'new lead'}`,
    [`${r?.name ?? reseller} has a new OKUNAMI enrollment from his card.`, ...leadLines({ ...fields, lang }), `Lead id: ${data.id}`]);
  return data.id as string;
}

/** Save what we know so far. The first save with a phone or email alerts Angel and the reseller; later saves are quiet. */
async function upsertLead(reseller: string, lang: string, source: string, id: string, raw: Record<string, unknown>) {
  const db = admin();
  const fields = Object.fromEntries(Object.entries(cleanLead(raw)).filter(([k, v]) => v !== null && v !== undefined && !(k === 'studio' && raw.studio === undefined)));
  if (id) {
    const { data: old } = await db.from('fc_reseller_leads').select('id, status').eq('id', id).maybeSingle();
    if (old) {
      if (old.status !== 'paid') await db.from('fc_reseller_leads').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
      return id;
    }
  }
  if (!fields.phone && !fields.email) return '';
  const { data, error } = await db.from('fc_reseller_leads').insert({ reseller, lang, source, ...fields }).select('id').single();
  if (error) throw error;
  const r = RESELLERS[reseller];
  await alert(recipients(reseller), `New OKUNAMI lead via ${r?.name ?? reseller}: ${fields.full_name ?? fields.phone ?? 'new lead'} (not paid yet)`,
    [`Someone started signing up on ${r?.name ?? reseller}'s card. They have not paid yet; the card keeps selling, and you get another email when they pay or choose Zelle or Apple Cash.`, ...leadLines({ ...fields, lang }), `Lead id: ${data.id}`]);
  return data.id as string;
}

/* ---------- Claude ---------- */
const LEAD_PROPS = {
  full_name: { type: 'string' }, business_name: { type: 'string' }, business_type: { type: 'string' },
  phone: { type: 'string' }, email: { type: 'string' },
  address: { type: 'string' }, hours: { type: 'string', description: 'AM/PM format, e.g. Mon-Fri 9:00 AM - 6:00 PM' },
  pain_points: { type: 'string' }, wants: { type: 'string', description: 'What they want on their card' },
  plan: { type: 'string', enum: ['pro', 'plus', 'team'] }, billing: { type: 'string', enum: ['month', 'year'] },
  seats: { type: 'integer', description: 'Business only, 3 or more cards' },
  studio: { type: 'boolean', description: 'true if they want a custom design: the custom card for Pro or Pro Plus (Founding 50 price while open), or the custom team design for Business' },
};
const TOOLS = [
  {
    name: 'save_lead',
    description: 'Save what you know about the person. Call it as soon as you have their name and a phone number or email, and again whenever you learn more. Set ready true only after they confirm the short summary: that shows the payment options under your message.',
    input_schema: { type: 'object', properties: { ...LEAD_PROPS, ready: { type: 'boolean' } } },
  },
  {
    name: 'show_designs',
    description: 'Show 3 real OKUNAMI card designs for their kind of business, right in the chat. Use it once you know what they do, and again if they ask to see more styles.',
    input_schema: { type: 'object', properties: { niche: { type: 'string', enum: ['barber', 'salon', 'realtor', 'food', 'church', 'trade', 'other'] } }, required: ['niche'] },
  },
];
const READY_NEEDS = ['full_name', 'business_name', 'phone', 'email', 'plan', 'billing'] as const;

type Msg = { role: 'user' | 'assistant'; content: unknown };

async function runAgent(lang: string, reseller: string, history: Msg[], leadIn: string) {
  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) return { offline: true };
  const model = Deno.env.get('OKUNAMI_AGENT_MODEL') ?? 'claude-haiku-5-5';
  const messages: { role: string; content: unknown }[] = history.slice(-30).map((m) => ({ role: m.role, content: clip(m.content, 1500) })).filter((m) => m.content);
  if (!messages.length || messages[0].role !== 'user') messages.unshift({ role: 'user', content: lang === 'es' ? 'Hola' : 'Hi' });
  const offer = await studioStatus().catch(() => null);
  let leadId = leadIn, designs: string | null = null, ready = false, known: Record<string, unknown> = {};
  if (leadId) {
    const { data } = await admin().from('fc_reseller_leads').select('*').eq('id', leadId).maybeSingle();
    if (data) known = data; else leadId = '';
  }
  const memo = leadId ? `\nALREADY SAVED FOR THIS PERSON: ${JSON.stringify(Object.fromEntries(Object.entries(known).filter(([k, v]) => v != null && (LEAD_PROPS as Record<string, unknown>)[k])))}` : '';
  const texts: string[] = [];
  for (let turn = 0; turn < 4; turn++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 700, system: systemPrompt('ola', lang, reseller, offer) + memo, messages, tools: TOOLS }),
    });
    if (!res.ok) { console.error('anthropic', res.status, await res.text()); return texts.length ? { reply: texts.join('\n'), lead_id: leadId || null, designs } : { offline: true }; }
    const out = await res.json() as { stop_reason: string; content: { type: string; id?: string; text?: string; name?: string; input?: Record<string, unknown> }[] };
    const text = out.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    if (text) texts.push(text);
    const uses = out.content.filter((c) => c.type === 'tool_use');
    if (!uses.length) break;
    const results = [];
    for (const u of uses) {
      let result = 'ok';
      if (u.name === 'show_designs') { designs = String(u.input?.niche ?? 'other'); result = 'Shown: 3 designs with their names, under your message.'; }
      if (u.name === 'save_lead') {
        const input = u.input ?? {};
        leadId = await upsertLead(reseller, lang, 'agent', leadId, input);
        if (leadId) {
          const { data } = await admin().from('fc_reseller_leads').select('*').eq('id', leadId).maybeSingle();
          known = data ?? known;
        }
        const missing = READY_NEEDS.filter((f) => !known[f]);
        if (!leadId) result = 'Not saved yet: a phone number or email is needed first.';
        else if (input.ready === true && missing.length) result = `Saved, but not ready for payment yet. Still missing: ${missing.join(', ')}.`;
        else if (input.ready === true) { ready = true; result = 'Saved. The payment options are now showing under your message.'; }
        else result = 'Saved.';
      }
      results.push({ type: 'tool_result', tool_use_id: u.id, content: result });
    }
    messages.push({ role: 'assistant', content: out.content }, { role: 'user', content: results });
    if (out.stop_reason !== 'tool_use') break;
  }
  const lead = ready && leadId ? { id: leadId, ...Object.fromEntries(['full_name', 'business_name', 'plan', 'billing', 'seats', 'studio', 'email'].map((k) => [k, known[k]])) } : null;
  return { reply: texts.join('\n\n'), lead_id: leadId || null, designs, lead };
}

/* ---------- Founding 50: custom Signature card ---------- */
async function studioStatus() {
  const { data } = await admin().rpc('fc_studio_offer_status');
  return data ?? { configured: false, active: false };
}
/** Card checkouts are confirmed when the buyer returns. If someone paid and closed the tab, find it here so the count stays right. */
async function reconcileStudio() {
  const db = admin();
  const since = new Date(Date.now() - 3 * 864e5).toISOString();
  const { data: open } = await db.from('fc_studio_claims').select('checkout_session').neq('status', 'paid').not('checkout_session', 'is', null).gte('created_at', since).limit(20);
  for (const c of open ?? []) {
    try {
      const s = await stripe().checkout.sessions.retrieve(c.checkout_session as string);
      if (s.status === 'complete') {
        await db.rpc('fc_studio_mark_paid', { p_session: s.id });
        await db.from('fc_reseller_leads').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('stripe_session_id', s.id).neq('status', 'paid');
      }
    } catch (e) { console.error('reconcile', e); }
  }
}

/* ---------- payment ---------- */
const OK_RETURN = /^https:\/\/([a-z0-9-]+\.)*(okunami\.pro|finessemedia\.pro|netlify\.app)(\/|$)/i;

async function pay(b: Record<string, unknown>) {
  const id = clip(b.id, 60);
  const db = admin();
  const { data: lead } = await db.from('fc_reseller_leads').select('*').eq('id', id).maybeSingle();
  if (!lead) return json({ error: 'We could not find that enrollment. Please start again.' }, 404);
  if (Date.now() - new Date(lead.created_at).getTime() > 14 * 864e5) return json({ error: 'This enrollment is older than 14 days. Please start a new one.' }, 410);
  const plan: Plan = b.plan === 'team' ? 'team' : b.plan === 'plus' ? 'plus' : 'pro';
  const billing: Interval = b.billing === 'year' ? 'year' : 'month';
  const seats = plan === 'team' ? clampSeats(b.seats) : null;
  const method = b.method === 'zelle' ? 'zelle' : b.method === 'applecash' ? 'applecash' : b.method === 'klarna' ? 'klarna' : 'card';
  const base = planCents(plan, billing, seats ?? 1);

  // Custom design, charged once with the plan. Pro and Pro Plus get the custom card: hold a Founding 50 spot,
  // or fall back to the regular price. Business gets the custom team design (no founding discount).
  const wantsStudio = b.studio === true || (b.studio === undefined && lead.studio === true);
  let studioCents = 0, claimId: number | null = null, founding = false, teamDesign = false, regularCents = 14900;
  if (wantsStudio && plan === 'team') {
    teamDesign = true;
    const offer = await studioStatus().catch(() => null) as Record<string, number> | null;
    const tc = Number(offer?.team_cents ?? 24900), inc = Number(offer?.team_included ?? 3), extra = Number(offer?.team_extra_cents ?? 3500);
    studioCents = tc + Math.max(0, (seats ?? 1) - inc) * extra;
  } else if (wantsStudio) {
    const key = (lead.email || lead.phone || lead.id) as string;
    const { data: claim, error } = await db.rpc('fc_studio_claim', { p_email: key, p_source: 'reseller', p_reseller: lead.reseller, p_lead: id, p_method: method });
    if (error) throw error;
    const offer = await studioStatus().catch(() => null) as Record<string, number> | null;
    regularCents = Number(offer?.regular_cents ?? 14900);
    studioCents = Number(claim?.price_cents ?? regularCents);
    founding = !!claim?.granted;
    claimId = claim?.claim_id ?? null;
  }
  const designName = teamDesign ? 'OKUNAMI Studio custom team design'
    : founding ? `OKUNAMI Studio custom card (Founding 50 price, regular $${(regularCents / 100).toFixed(0)})` : 'OKUNAMI Studio custom card';
  const dueNow = base + studioCents;
  if (method === 'klarna' && (billing !== 'year' || wantsStudio || dueNow + klarnaFeeFor(dueNow) > KLARNA_MAX)) {
    return json({ error: lead.lang === 'es' ? 'Klarna está disponible solo para planes anuales sin diseño a la medida. Usa tarjeta, Zelle o Apple Cash.' : 'Klarna is available for yearly plans without a custom design. Please use card, Zelle or Apple Cash.' }, 400);
  }

  if (method === 'zelle' || method === 'applecash') {
    await db.from('fc_reseller_leads').update({ plan, billing, seats, studio: wantsStudio, studio_cents: wantsStudio ? studioCents : null, payment_method: method, status: 'awaiting_payment', amount_cents: dueNow, fee_cents: 0, updated_at: new Date().toISOString() }).eq('id', id);
    const how = method === 'zelle' ? 'Zelle' : 'Apple Cash';
    await alert(recipients(lead.reseller), `${how} payment coming: ${lead.business_name ?? lead.full_name} ($${(dueNow / 100).toFixed(2)})`,
      [`${lead.full_name} chose to pay by ${how}: $${(dueNow / 100).toFixed(2)} to 407-960-9004.`,
       teamDesign ? `Includes a custom team design at $${(studioCents / 100).toFixed(2)} for ${seats} cards.` : wantsStudio ? (founding ? `Includes a Founding 50 custom design at $${(studioCents / 100).toFixed(2)}. Their spot is held for 72 hours. When the money arrives, run in Supabase: select public.fc_studio_confirm_manual('${lead.email ?? lead.phone ?? id}', '${how} received');` : `Includes a custom design at the regular $${(studioCents / 100).toFixed(2)} (Founding 50 is closed).`) : 'Plan only, no custom design.',
       'Confirm it arrived, then set up their card.', ...leadLines({ ...lead, plan, billing, seats, studio: wantsStudio, studio_cents: studioCents })]);
    return json({ ok: true, amount_cents: dueNow, studio_cents: studioCents, founding, team_design: teamDesign });
  }

  const fee = method === 'klarna' ? klarnaFeeFor(base) : feeFor(base);
  // One-time part of the processing fee for the design, so the first charge still nets the full amount.
  const firstFee = wantsStudio ? feeFor(dueNow) - fee : 0;
  const ret = typeof b.returnUrl === 'string' && OK_RETURN.test(b.returnUrl) ? b.returnUrl.split('#')[0].split('?')[0] : 'https://okunami.pro/';
  const reseller = lead.reseller as string;
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer_email: lead.email ?? undefined,
    payment_method_types: [method === 'klarna' ? 'klarna' : 'card'],
    line_items: [
      lineItemFor(plan, billing, false, 0, seats ?? 1),   // the plan stays first: the OKUNAMI webhook reads item 0
      { quantity: 1, price_data: { currency: 'usd', unit_amount: fee, recurring: { interval: billing }, product_data: { name: method === 'klarna' ? 'Klarna processing fee' : 'Card processing fee' } } },
      ...(wantsStudio ? [
        { quantity: 1, price_data: { currency: 'usd', unit_amount: studioCents, product_data: { name: designName } } },
        ...(firstFee > 0 ? [{ quantity: 1, price_data: { currency: 'usd', unit_amount: firstFee, product_data: { name: 'Card processing fee (custom design)' } } }] : []),
      ] : []),
    ],
    ...(claimId ? { expires_at: Math.floor(Date.now() / 1000) + 45 * 60 } : {}),
    subscription_data: { metadata: { okunami_plan: plan, okunami_interval: billing, okunami_seats: seats ? String(seats) : '', okunami_founding: '0', okunami_reseller: reseller, okunami_lead_id: id } },
    metadata: { okunami_plan: plan, okunami_reseller: reseller, okunami_lead_id: id, ...(claimId ? { okunami_studio_claim: String(claimId) } : {}), ...(wantsStudio ? { okunami_studio_cents: String(studioCents) } : {}) },
    success_url: `${ret}?paid=1&lead=${id}&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${ret}?checkout=canceled`,
  });
  if (claimId) await db.rpc('fc_studio_attach', { p_claim: claimId, p_session: session.id });
  await db.from('fc_reseller_leads').update({ plan, billing, seats, studio: wantsStudio, studio_cents: wantsStudio ? studioCents : null, payment_method: method, status: 'checkout_started', stripe_session_id: session.id, amount_cents: dueNow, fee_cents: fee + firstFee, updated_at: new Date().toISOString() }).eq('id', id);
  return json({ url: session.url, amount_cents: dueNow, fee_cents: fee + firstFee, studio_cents: studioCents, founding, team_design: teamDesign });
}

async function confirm(b: Record<string, unknown>) {
  const id = clip(b.id, 60), sid = clip(b.session, 200);
  const db = admin();
  const { data: lead } = await db.from('fc_reseller_leads').select('*').eq('id', id).maybeSingle();
  if (!lead || lead.stripe_session_id !== sid) return json({ paid: false });
  if (lead.status === 'paid') return json({ paid: true, name: lead.full_name });
  const s = await stripe().checkout.sessions.retrieve(sid);
  const paid = s.status === 'complete';
  if (paid) {
    await db.from('fc_reseller_leads').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', id).neq('status', 'paid');
    await db.rpc('fc_studio_mark_paid', { p_session: sid });
    await alert(recipients(lead.reseller), `PAID: ${lead.business_name ?? lead.full_name} signed up for OKUNAMI`,
      [`${lead.full_name} paid by ${lead.payment_method === 'klarna' ? 'Klarna' : 'card'} ($${((s.amount_total ?? 0) / 100).toFixed(2)} incl. processing fee). Time to build their card.`, ...leadLines(lead)]);
  }
  return json({ paid, name: lead.full_name });
}

/** After payment: the card details we no longer ask for before checkout. */
async function details(b: Record<string, unknown>) {
  const id = clip(b.id, 60);
  const d = (b.details ?? {}) as Record<string, unknown>;
  const db = admin();
  const { data: lead } = await db.from('fc_reseller_leads').select('*').eq('id', id).maybeSingle();
  if (!lead) return json({ error: 'We could not find that enrollment.' }, 404);
  const upd = { address: clip(d.address, 200) || lead.address, hours: clip(d.hours, 200) || lead.hours, wants: clip(d.wants, 1200) || lead.wants, pain_points: clip(d.pain_points, 1200) || lead.pain_points, notes: clip(d.notes, 1200) || lead.notes };
  await db.from('fc_reseller_leads').update({ ...upd, updated_at: new Date().toISOString() }).eq('id', id);
  await alert(recipients(lead.reseller), `Card details from ${lead.business_name ?? lead.full_name}`,
    [`${lead.full_name} sent the details for their card.`, ...leadLines({ ...lead, ...upd }), `Notes: ${upd.notes ?? '-'}`]);
  return json({ ok: true });
}

/** "Not ready yet": email them a link that brings them back to their checkout. */
async function later(b: Record<string, unknown>) {
  const id = clip(b.id, 60);
  const db = admin();
  const { data: lead } = await db.from('fc_reseller_leads').select('*').eq('id', id).maybeSingle();
  if (!lead) return json({ error: 'We could not find that enrollment.' }, 404);
  const base = typeof b.returnUrl === 'string' && OK_RETURN.test(b.returnUrl) ? b.returnUrl.split('#')[0].split('?')[0] : 'https://okunami.pro/';
  const link = `${base}?resume=${id}`;
  const r = RESELLERS[lead.reseller];
  const es = lead.lang === 'es';
  let emailed = false;
  if (lead.email) {
    const first = String(lead.full_name ?? '').split(' ')[0];
    await alert([lead.email], es ? 'Tu tarjeta OKUNAMI te espera' : 'Your OKUNAMI card is waiting',
      es ? [`Hola ${first},`, 'Guardamos todo lo que hablamos. Cuando estés listo, abre este enlace para terminar en un minuto:', link, 'Los lugares de Fundadores 50 se apartan solo al pagar, así que no esperes mucho.', `${r?.name ?? 'Hiram'} · ${r?.phone ?? ''}`]
         : [`Hi ${first},`, 'Everything we talked about is saved. When you are ready, open this link to finish in about a minute:', link, 'Founding 50 spots are only held once you pay, so do not wait too long.', `${r?.name ?? 'Hiram'} · ${r?.phone ?? ''}`]);
    emailed = !!Deno.env.get('RESEND_API_KEY');
  }
  await alert(recipients(lead.reseller), `Follow up: ${lead.business_name ?? lead.full_name} is not ready yet`,
    [`${lead.full_name} asked for the link to finish later.${lead.email ? ' It was emailed to them.' : ''}`, `Their link: ${link}`, ...leadLines(lead)]);
  return json({ ok: true, emailed, link });
}

/** Reopen a saved enrollment from the emailed link. Only what the checkout needs leaves the server. */
async function resume(b: Record<string, unknown>) {
  const id = clip(b.id, 60);
  const { data: lead } = await admin().from('fc_reseller_leads').select('id, full_name, business_name, email, plan, billing, seats, studio, status, created_at').eq('id', id).maybeSingle();
  if (!lead) return json({ error: 'We could not find that enrollment.' }, 404);
  return json({ lead: { ...lead, full_name: String(lead.full_name ?? '').split(' ')[0] } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'anon';
  if (limited(ip)) return json({ error: 'Too many messages. Please wait a few minutes.' }, 429);
  try {
    const b = await req.json().catch(() => ({})) as Record<string, unknown>;
    const reseller = typeof b.reseller === 'string' && RESELLERS[b.reseller] ? b.reseller : 'hiram-diaz';
    const lang = b.lang === 'es' ? 'es' : 'en';
    switch (b.action) {
      case 'health': return json({ ai: !!Deno.env.get('ANTHROPIC_API_KEY') });
      case 'offer': { await reconcileStudio().catch(() => {}); return json(await studioStatus()); }
      case 'agent': {
        const msgs = Array.isArray(b.messages) ? (b.messages as Msg[]).filter((m) => m && (m.role === 'user' || m.role === 'assistant')) : [];
        if (msgs.length > 60) return json({ reply: lang === 'es' ? 'Esta conversación ya está larga. Escríbele a Hiram directamente para seguir.' : 'This chat is getting long. Message Hiram directly to keep going.' });
        return json(await runAgent(lang, reseller, msgs, clip(b.lead_id, 60)));
      }
      case 'save': {
        const fields = cleanLead((b.lead ?? {}) as Record<string, unknown>);
        if (!fields.full_name || !(fields.phone || fields.email)) return json({ error: 'Name and a phone or email are needed.' }, 400);
        const id = await insertLead(reseller, lang, 'form', fields);
        return json({ lead: { id, ...fields } });
      }
      case 'lead': {
        const id = await upsertLead(reseller, lang, 'form', clip(b.id, 60), (b.lead ?? {}) as Record<string, unknown>);
        return json({ id: id || null });
      }
      case 'details': return await details(b);
      case 'later': return await later(b);
      case 'resume': return await resume(b);
      case 'pay': return await pay(b);
      case 'confirm': return await confirm(b);
      default: return json({ error: 'Unknown action.' }, 400);
    }
  } catch (e) {
    console.error('okunami-reseller', e);
    return json({ error: 'Something went wrong. Please try again, or message Hiram directly.' }, 500);
  }
});
