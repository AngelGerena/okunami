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

Deno.test('flat design and agent fees, 30% of first 12 months, cleared after 30 days, clawback', () => {
  const now = new Date('2026-12-20T12:00:00Z');
  // $149 custom card + Pro Plus yearly $159, paid 40 days ago: $15 + 30% of 159 = 15.00 + 47.70, cleared
  let e = earning({ status: 'paid', studio: true, studio_cents: 14900, amount_cents: 30800, plan: 'plus', billing: 'year', paid_at: '2026-11-10T10:00:00Z' }, now);
  eq([e.design_c, e.plan_c, e.earned, e.cleared, e.owed, e.state], [1500, 4770, 6270, true, 6270, 'ready'], 'custom card + yearly');
  // Founding $99 card pays the same $15
  e = earning({ status: 'paid', studio: true, studio_cents: 9900, amount_cents: 9900 + 7900, plan: 'pro', billing: 'year', paid_at: '2026-11-10T10:00:00Z' }, now);
  eq([e.design_c, e.plan_c], [1500, 2370], 'founding card + Pro yearly');
  // team design on Business (5 cards yearly = $300) + 2 AI agents: $25 + $20 + 30% of 300
  e = earning({ status: 'paid', studio: true, studio_cents: 24900, agent_count: 2, amount_cents: 24900 + 30000, plan: 'team', billing: 'year', paid_at: '2026-11-10T10:00:00Z' }, now);
  eq([e.design_c, e.plan_c, e.earned], [4500, 9000, 13500], 'team design + agents');
  // same, paid 5 days ago: pending
  e = earning({ status: 'paid', studio: true, studio_cents: 14900, amount_cents: 30800, plan: 'plus', billing: 'year', paid_at: '2026-12-15T10:00:00Z' }, now);
  eq([e.state, e.owed], ['pending', 0], 'within 30 days');
  // monthly Pro Plus $16, 15 payments recorded: capped at 12 -> 30% of 192 = 57.60
  e = earning({ status: 'paid', amount_cents: 1600, plan: 'plus', billing: 'month', plan_payments: 15, paid_at: '2026-01-01T00:00:00Z' }, now);
  eq([e.payments, e.plan_c], [12, 5760], 'monthly capped at 12');
  // already paid out
  e = earning({ status: 'paid', amount_cents: 7900, plan: 'pro', billing: 'year', paid_at: '2026-10-01T00:00:00Z', commission_paid_cents: 2370 }, now);
  eq([e.earned, e.owed, e.state], [2370, 0, 'paid'], 'paid out');
  // refunded after payout: earns nothing, the paid amount comes back
  e = earning({ status: 'not_interested', amount_cents: 7900, billing: 'year', paid_at: '2026-10-01T00:00:00Z', commission_paid_cents: 2370 }, now);
  eq([e.earned, e.owed, e.state], [0, -2370, 'clawback'], 'clawback');
  // fees never count: design-only sale with a fee recorded earns just the $15
  e = earning({ status: 'paid', amount_cents: 9900, studio_cents: 9900, fee_cents: 317, plan: 'pro', paid_at: '2026-10-01T00:00:00Z' }, now);
  eq(e.earned, 1500, 'no commission on fees');
});

Deno.test('totals and the $100 bonus at 10 clients a month', () => {
  const now = new Date('2026-12-20T12:00:00Z');
  const oct = Array.from({ length: 10 }, (_, i) => ({ status: 'paid', amount_cents: 7900, billing: 'year', paid_at: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00Z` }));
  const dec = Array.from({ length: 3 }, () => ({ status: 'paid', amount_cents: 7900, billing: 'year', paid_at: '2026-12-10T12:00:00Z' }));
  const other = [{ status: 'contacted', follow_up: '2026-12-19' }, { status: 'interested', follow_up: '2026-12-25' }, { status: 'new' }];
  let t = totals([...oct, ...dec, ...other], [], now);
  eq([t.paid, t.talking, t.follow_ups_due, t.bonus.this_month_clients, t.bonus.months.length], [13, 2, 1, 3, 1], 'counts');
  eq([t.earned_cents, t.ready_cents, t.pending_cents], [13 * 2370 + 10000, 10 * 2370 + 10000, 3 * 2370], 'money');
  t = totals([...oct, ...dec], ['2026-10'], now);
  eq([t.ready_cents, t.paid_out_cents], [10 * 2370, 10000], 'bonus paid');
});
