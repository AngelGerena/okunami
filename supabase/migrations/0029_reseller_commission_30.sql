-- Migration 0029: reseller plan update (Nov 7, 2026).
-- 30% of the client's first 12 months of plan payments (was 40%), and flat finder's fees on one-time builds
-- because Angel does the build: $15 per custom card, $25 per custom team design, $10 per custom AI agent (was 25%).
-- The numbers live in supabase/functions/okunami-partner/logic.ts (TERMS). This adds the count of AI agents sold
-- on a sale, which the flat agent fee needs, and keeps the informational commission_rate in step.

alter table public.fc_reseller_leads add column if not exists agent_count int not null default 0;
alter table public.fc_reseller_leads drop constraint if exists fc_reseller_leads_agent_count_range;
alter table public.fc_reseller_leads add constraint fc_reseller_leads_agent_count_range check (agent_count between 0 and 50);

alter table public.fc_partner_access alter column commission_rate set default 0.30;
update public.fc_partner_access set commission_rate = 0.30 where commission_rate = 0.40;

comment on column public.fc_reseller_leads.agent_count is 'Custom AI agents sold on this sale; each pays the reseller a flat $10 (okunami-partner TERMS.agentFeeCents).';

notify pgrst, 'reload schema';
