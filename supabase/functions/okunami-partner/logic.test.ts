import { makeToken, readToken, totals } from './logic.ts';
const eq = (a: unknown, b: unknown, m: string) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };

Deno.test('token round trip, wrong hash, expired, tampered', () => {
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'srk');
  const t = makeToken('hiram-diaz', 'H1');
  eq(readToken(t, (w) => (w === 'hiram-diaz' ? 'H1' : null)), 'hiram-diaz', 'valid');
  eq(readToken(t, () => 'H2'), null, 'PIN changed signs out');
  eq(readToken(makeToken('hiram-diaz', 'H1', Date.now() - 31 * 864e5), () => 'H1'), null, 'expired');
  eq(readToken(t.replace('hiram-diaz', 'admin'), () => 'H1'), null, 'cannot become admin');
  eq(readToken('garbage', () => 'H1'), null, 'garbage');
});

Deno.test('commission only on paid amounts (no fee), month totals, follow-ups', () => {
  const now = new Date('2026-11-15T12:00:00');
  const leads = [
    { status: 'paid', amount_cents: 9900, fee_cents: 317, paid_at: '2026-11-03T10:00:00Z' },
    { status: 'paid', amount_cents: 17800, paid_at: '2026-10-20T10:00:00Z' },
    { status: 'contacted', follow_up: '2026-11-14' },
    { status: 'interested', follow_up: '2026-11-20' },
    { status: 'not_interested', follow_up: '2026-11-01' },
    { status: 'new' },
  ];
  const t = totals(leads, 0.4, now);
  eq([t.leads, t.paid, t.sales_cents, t.commission_cents, t.month_sales_cents, t.month_commission_cents, t.talking, t.follow_ups_due],
     [6, 2, 27700, 11080, 9900, 3960, 2, 1], 'totals');
});
