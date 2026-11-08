// Pure helpers for okunami-partner (tested in logic.test.ts).
import { createHmac, timingSafeEqual } from 'node:crypto';

/* Each reseller (name, email, card, link, code) lives in _shared/partners.ts. */
import { PARTNERS } from '../_shared/partners.ts';
export { PARTNERS };
/* Cards allowed to send referrals with action 'refer'. */
export const VIA: Record<string, { label: string; prefix: string }> = {
  'mayra-card': { label: "Mayra Soto Burgos's card", prefix: 'MSB' },
};

export const PARTNER_STATUSES = ['new', 'contacted', 'interested', 'not_interested'];
export const ADMIN_STATUSES = [...PARTNER_STATUSES, 'awaiting_payment', 'checkout_started', 'paid'];
export const DAY = 864e5;
export const clip = (v: unknown, n = 200) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/* ---------- sessions: HMAC with a key that includes the PIN hash, so changing a PIN signs that person out ---------- */
const signKey = (pinHash: string) => (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '') + ':partner:' + pinHash;
const mac = (v: string, k: string) => createHmac('sha256', k).update(v).digest('base64url');
const same = (a: string, b: string) => { const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b); return x.length === y.length && timingSafeEqual(x, y); };
export function makeToken(who: string, pinHash: string, now = Date.now()) {
  const exp = String(now + 30 * DAY);
  return `${who}.${exp}.${mac(who + '.' + exp, signKey(pinHash))}`;
}
export function readToken(token: string, hashFor: (who: string) => string | null, now = Date.now()): string | null {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [who, exp, sig] = parts;
  if (!(Number(exp) > now)) return null;
  const h = hashFor(who);
  return h && same(sig, mac(who + '.' + exp, signKey(h))) ? who : null;
}

/* ---------- the reseller plan (Nov 2026): the one place these numbers live ----------
   30% of the client's first 12 months of plan payments, nothing after that.
   Flat finder's fees on one-time builds, because Angel does the build: $15 per custom card (Founding or regular price),
   $25 per custom team design (Business, any team size), $10 per custom AI agent.
   A sale counts as a custom design when studio is true (or studio_cents > 0); agents sold are counted in agent_count.
   Sales from okunami.pro count when the client signed up with the reseller's link or code (remembered 90 days)
   and paid for a plan within 3 months of signing up.
   $100 bonus in any calendar month with 10 or more new paying clients (one bonus per month).
   Paid per sale once the client's payment has cleared (30 days after it was paid).
   Figured on the plan price only: never on processing fees, taxes or AI credits.
   A refunded or disputed sale earns nothing; commission already paid on it comes off the next payout. */
export const TERMS = { planRate: 0.30, planMonths: 12, cardFeeCents: 1500, teamDesignFeeCents: 2500, agentFeeCents: 1000, bonusCents: 10000, bonusAt: 10, clearDays: 30 };

type Lead = Record<string, unknown>;
const n = (v: unknown) => Number(v) || 0;
const ym = (d: unknown) => { const x = new Date(String(d)); return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}`; };

/** What one sale earns. amount_cents = design + one plan payment; studio_cents = the design part (the plan part is what earns 30%). */
export function earning(l: Lead, now = new Date()) {
  const paid = l.status === 'paid';
  const design = Math.max(0, n(l.studio_cents));
  const plan = Math.max(0, n(l.amount_cents) - design);                     // one plan payment
  const payments = l.billing === 'month' ? Math.min(TERMS.planMonths, Math.max(1, n(l.plan_payments) || 1)) : 1;   // a yearly payment covers all 12 months
  const hasDesign = l.studio === true || design > 0;
  const agents = Math.max(0, Math.min(50, Math.round(n(l.agent_count))));
  const design_c = paid ? (hasDesign ? (l.plan === 'team' ? TERMS.teamDesignFeeCents : TERMS.cardFeeCents) : 0) + agents * TERMS.agentFeeCents : 0;   // flat fees
  const plan_c = paid ? Math.round(plan * payments * TERMS.planRate) : 0;
  const earned = design_c + plan_c;
  const clears = l.paid_at ? new Date(new Date(String(l.paid_at)).getTime() + TERMS.clearDays * DAY) : null;
  const cleared = paid && !!clears && clears <= now;
  const paid_out = n(l.commission_paid_cents);
  const owed = (cleared ? earned : 0) - paid_out;                            // negative = a refund to take back
  return { design_c, plan_c, earned, payments, clears: clears ? clears.toISOString() : null, cleared, paid_out, owed,
    state: !paid ? (paid_out > 0 ? 'clawback' : 'none') : !cleared ? 'pending' : owed > 0 ? 'ready' : 'paid' };
}

/** Months with 10+ new paying clients, and this month's progress. bonusPaid = months already paid ('YYYY-MM'). */
export function bonuses(leads: Lead[], bonusPaid: string[], now = new Date()) {
  const count: Record<string, number> = {};
  for (const l of leads) if (l.status === 'paid' && l.paid_at) count[ym(l.paid_at)] = (count[ym(l.paid_at)] ?? 0) + 1;
  const thisMonth = ym(now.toISOString());
  const months = Object.keys(count).filter((m) => count[m] >= TERMS.bonusAt).sort().map((m) => ({ month: m, clients: count[m], paid: bonusPaid.includes(m), ready: m < thisMonth }));
  return { this_month: thisMonth, this_month_clients: count[thisMonth] ?? 0, months };
}

export function totals(leads: Lead[], bonusPaid: string[] = [], now = new Date()) {
  const e = leads.map((l) => earning(l, now));
  const b = bonuses(leads, bonusPaid, now);
  const sum = (f: (x: ReturnType<typeof earning>) => number) => e.reduce((t, x) => t + f(x), 0);
  const bonusEarned = b.months.length * TERMS.bonusCents;
  const bonusOwed = b.months.filter((m) => m.ready && !m.paid).length * TERMS.bonusCents;   // a month's bonus is paid after the month ends
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  return {
    leads: leads.length,
    talking: leads.filter((l) => ['contacted', 'interested', 'checkout_started', 'awaiting_payment'].includes(String(l.status))).length,
    paid: leads.filter((l) => l.status === 'paid').length,
    earned_cents: sum((x) => x.earned) + bonusEarned,
    ready_cents: sum((x) => Math.max(0, x.owed)) + bonusOwed,
    clawback_cents: sum((x) => Math.min(0, x.owed)),
    pending_cents: sum((x) => (x.state === 'pending' ? x.earned : 0)),
    paid_out_cents: sum((x) => x.paid_out) + b.months.filter((m) => m.paid).length * TERMS.bonusCents,
    bonus: b,
    follow_ups_due: leads.filter((l) => l.follow_up && l.status !== 'paid' && l.status !== 'not_interested' && new Date(String(l.follow_up) + 'T23:59:59') <= new Date(today.getTime() + DAY - 1)).length,
    terms: TERMS,
  };
}
