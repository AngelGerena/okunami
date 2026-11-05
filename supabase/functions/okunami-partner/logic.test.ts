import { earning, makeToken, readToken, totals } from './logic.ts';
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

Deno.test('25% design, 40% of first 12 months, cleared after 30 days, clawback', () => {
  const now = new Date('2026-12-20T12:00:00Z');
  // $149 design + Pro Plus yearly $149, paid 40 days ago: 37.25 + 59.60, cleared
  let e = earning({ status: 'paid', studio_cents: 14900, amount_cents: 29800, billing: 'year', paid_at: '2026-11-10T10:00:00Z' }, now);
  eq([e.design_c, e.plan_c, e.earned, e.cleared, e.owed, e.state], [3725, 5960, 9685, true, 9685, 'ready'], 'design + yearly');
  // same, paid 5 days ago: pending
  e = earning({ status: 'paid', studio_cents: 14900, amount_cents: 29800, billing: 'year', paid_at: '2026-12-15T10:00:00Z' }, now);
  eq([e.state, e.owed], ['pending', 0], 'within 30 days');
  // monthly Pro Plus $16, 15 payments recorded: capped at 12 -> 40% of 192 = 76.80
  e = earning({ status: 'paid', amount_cents: 1600, billing: 'month', plan_payments: 15, paid_at: '2026-01-01T00:00:00Z' }, now);
  eq([e.payments, e.plan_c], [12, 7680], 'monthly capped at 12');
  // already paid out
  e = earning({ status: 'paid', amount_cents: 7900, billing: 'year', paid_at: '2026-10-01T00:00:00Z', commission_paid_cents: 3160 }, now);
  eq([e.earned, e.owed, e.state], [3160, 0, 'paid'], 'paid out');
  // refunded after payout: earns nothing, the paid amount comes back
  e = earning({ status: 'not_interested', amount_cents: 7900, billing: 'year', paid_at: '2026-10-01T00:00:00Z', commission_paid_cents: 3160 }, now);
  eq([e.earned, e.owed, e.state], [0, -3160, 'clawback'], 'clawback');
  // fees never count
  e = earning({ status: 'paid', amount_cents: 9900, studio_cents: 9900, fee_cents: 317, paid_at: '2026-10-01T00:00:00Z' }, now);
  eq(e.earned, 2475, 'no commission on fees');
});

Deno.test('totals and the $100 bonus at 10 clients a month', () => {
  const now = new Date('2026-12-20T12:00:00Z');
  const oct = Array.from({ length: 10 }, (_, i) => ({ status: 'paid', amount_cents: 7900, billing: 'year', paid_at: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00Z` }));
  const dec = Array.from({ length: 3 }, () => ({ status: 'paid', amount_cents: 7900, billing: 'year', paid_at: '2026-12-10T12:00:00Z' }));
  const other = [{ status: 'contacted', follow_up: '2026-12-19' }, { status: 'interested', follow_up: '2026-12-25' }, { status: 'new' }];
  let t = totals([...oct, ...dec, ...other], [], now);
  eq([t.paid, t.talking, t.follow_ups_due, t.bonus.this_month_clients, t.bonus.months.length], [13, 2, 1, 3, 1], 'counts');
  eq([t.earned_cents, t.ready_cents, t.pending_cents], [13 * 3160 + 10000, 10 * 3160 + 10000, 3 * 3160], 'money');
  t = totals([...oct, ...dec], ['2026-10'], now);
  eq([t.ready_cents, t.paid_out_cents], [10 * 3160, 10000], 'bonus paid');
});
