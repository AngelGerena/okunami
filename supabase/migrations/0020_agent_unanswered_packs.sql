-- Questions the agent could not answer from the owner's info. Only written when the owner turns it on for that agent.
create table if not exists ag_unanswered (
  id bigint generated always as identity primary key,
  account_id uuid not null references ag_accounts(id) on delete cascade,
  site_id uuid references ag_sites(id) on delete set null,
  question text not null,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists ag_unanswered_acct on ag_unanswered (account_id, created_at desc);
alter table ag_unanswered enable row level security;
drop policy if exists own_unanswered on ag_unanswered;
create policy own_unanswered on ag_unanswered for select using (account_id in (select id from ag_accounts where owner_id = auth.uid()));

-- Signed-in owners may read the credit pack list (and nothing else in settings: markup and limits stay private).
drop policy if exists read_packs on ag_settings;
create policy read_packs on ag_settings for select to authenticated using (key = 'packs');
