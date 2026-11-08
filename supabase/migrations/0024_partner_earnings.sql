-- Reseller plan (Nov 2026, first version; see 0029 for the current rates): 25% of a custom design, 40% of the first 12 months of plan payments, $100 bonus
-- for 10+ new paying clients in a month, paid per sale once the client's payment clears (30 days).
-- The math lives in supabase/functions/okunami-partner/logic.ts (TERMS). These columns record what happened.
alter table public.fc_reseller_leads
  add column if not exists plan_payments int not null default 1,          -- monthly plans: payments collected so far (commission stops at 12)
  add column if not exists commission_paid_cents int not null default 0,  -- commission already paid out on this sale
  add column if not exists commission_paid_at timestamptz;

-- Monthly bonuses already paid out ('YYYY-MM'). Service role only (RLS on, no policies).
create table if not exists public.fc_partner_bonus (
  reseller text not null,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  paid_at timestamptz not null default now(),
  primary key (reseller, month)
);
alter table public.fc_partner_bonus enable row level security;
