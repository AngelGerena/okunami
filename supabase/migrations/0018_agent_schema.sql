-- AI agent service: accounts, sites, agents, credit ledger, usage log, adjustable settings.
-- Already applied to the live database on 2026-10-18; kept here as the record. Do not run twice.
create table ag_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  source text not null default 'external' check (source in ('okunami','external')),
  balance_micros bigint not null default 0,
  daily_cap_micros bigint,
  created_at timestamptz not null default now()
);
create table ag_sites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references ag_accounts(id) on delete cascade,
  label text not null,
  public_key text not null unique default replace(gen_random_uuid()::text,'-',''),
  allowed_origins text[] not null default '{}',
  enabled boolean not null default true
);
create table ag_agents (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references ag_sites(id) on delete cascade,
  kind text not null check (kind in ('assistant','custom','usage_meter')),
  name text not null,
  config jsonb not null default '{}',
  counts_toward_included boolean not null default true,
  enabled boolean not null default true
);
create table ag_ledger (
  id bigint generated always as identity primary key,
  account_id uuid not null references ag_accounts(id) on delete cascade,
  kind text not null check (kind in ('purchase','grant','usage','refund','adjust')),
  amount_micros bigint not null,
  ref text,
  created_at timestamptz not null default now(),
  unique (kind, ref)
);
create table ag_usage (
  id bigint generated always as identity primary key,
  account_id uuid not null references ag_accounts(id) on delete cascade,
  site_id uuid references ag_sites(id) on delete set null,
  agent_id uuid references ag_agents(id) on delete set null,
  model text,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cached_tokens int not null default 0,
  cost_micros bigint not null default 0,
  charge_micros bigint not null default 0,
  answered_without_ai boolean not null default false,
  visitor_hash text,
  created_at timestamptz not null default now()
);
create index on ag_usage (account_id, created_at desc);
create table ag_settings (key text primary key, value jsonb not null);
insert into ag_settings (key, value) values
  ('markup_multiplier', '2.0'),
  ('limits', '{"visitor_msgs_per_hour":20,"max_reply_tokens":400,"max_turns":12,"default_daily_cap_usd":3}'),
  ('model_rates', '{}'),
  ('packs', '[{"id":"p1","name":"Starter","price_cents":1000,"credits_usd":10},{"id":"p2","name":"Business","price_cents":2500,"credits_usd":25},{"id":"p3","name":"Pro","price_cents":5000,"credits_usd":50}]');
create function ag_apply_ledger() returns trigger language plpgsql security definer set search_path = public as $$
begin update ag_accounts set balance_micros = balance_micros + new.amount_micros where id = new.account_id; return new; end $$;
create trigger ag_ledger_balance after insert on ag_ledger for each row execute function ag_apply_ledger();
alter table ag_accounts enable row level security; alter table ag_sites enable row level security; alter table ag_agents enable row level security;
alter table ag_ledger enable row level security; alter table ag_usage enable row level security; alter table ag_settings enable row level security;
create policy own_account on ag_accounts for select using (owner_id = auth.uid());
create policy own_sites   on ag_sites    for select using (account_id in (select id from ag_accounts where owner_id = auth.uid()));
create policy own_agents  on ag_agents   for select using (site_id in (select s.id from ag_sites s join ag_accounts a on a.id = s.account_id where a.owner_id = auth.uid()));
create policy own_ledger  on ag_ledger   for select using (account_id in (select id from ag_accounts where owner_id = auth.uid()));
create policy own_usage   on ag_usage    for select using (account_id in (select id from ag_accounts where owner_id = auth.uid()));
alter publication supabase_realtime add table ag_usage, ag_accounts;
