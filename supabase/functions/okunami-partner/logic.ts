// Pure helpers for okunami-partner (tested in logic.test.ts).
import { createHmac, timingSafeEqual } from 'node:crypto';

/* Each reseller's card: the dashboard's "checkout link" reopens a saved enrollment there (?resume=<id>). */
export const PARTNERS: Record<string, { name: string; email: string; card: string }> = {
  'hiram-diaz': { name: 'Hiram Diaz', email: 'hiramdiazm@gmail.com', card: 'https://hiram-okunami.netlify.app/' },
};
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

/* ---------- totals: commission is on what the client paid for OKUNAMI, never on the processing fee ---------- */
type Lead = Record<string, unknown>;
export function totals(leads: Lead[], rate: number, now = new Date()) {
  const paid = leads.filter((l) => l.status === 'paid');
  const sum = (ls: Lead[]) => ls.reduce((t, l) => t + (Number(l.amount_cents) || 0), 0);
  const ym = (d: unknown) => { const x = new Date(String(d)); return x.getFullYear() * 12 + x.getMonth(); };
  const thisMonth = paid.filter((l) => ym(l.paid_at ?? l.updated_at) === now.getFullYear() * 12 + now.getMonth());
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  return {
    leads: leads.length,
    talking: leads.filter((l) => ['contacted', 'interested', 'checkout_started', 'awaiting_payment'].includes(String(l.status))).length,
    paid: paid.length,
    sales_cents: sum(paid),
    commission_cents: Math.round(sum(paid) * rate),
    month_sales_cents: sum(thisMonth),
    month_commission_cents: Math.round(sum(thisMonth) * rate),
    follow_ups_due: leads.filter((l) => l.follow_up && l.status !== 'paid' && l.status !== 'not_interested' && new Date(String(l.follow_up) + 'T23:59:59') <= new Date(today.getTime() + DAY - 1)).length,
    rate,
  };
}

