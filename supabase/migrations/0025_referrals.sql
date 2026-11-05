-- Reseller referrals from okunami.pro (Nov 2026).
-- A visitor arrives with a reseller's link (okunami.pro/?ref=hiram) or types their code (HIRAM) when signing up.
-- The browser remembers it for 90 days. Once the person has an account, fc_claim_referral() tags the account.
-- When that account pays for a plan within 3 months of signing up, the Stripe webhook adds the sale to the
-- reseller's dashboard (fc_reseller_leads, source 'site'). Monthly renewals count up to 12 plan payments.

-- Which reseller brought this account, and when it was tagged. Only the server writes these (no grant to users).
alter table public.fc_profiles
  add column if not exists referred_by text,
  add column if not exists referred_at timestamptz;

-- A sale from okunami.pro is tied to the account that paid, one sale per account.
alter table public.fc_reseller_leads
  add column if not exists user_id uuid,
  add column if not exists last_invoice_id text;   -- the last renewal counted, so a repeated webhook never counts twice
create unique index if not exists fc_reseller_leads_user_id on public.fc_reseller_leads (user_id) where user_id is not null;

-- Codes people type or carry in a link. Keep in step with PARTNERS in supabase/functions/_shared/partners.ts.
create table if not exists public.fc_partner_codes (
  code text primary key check (code = upper(code)),
  reseller text not null
);
alter table public.fc_partner_codes enable row level security;   -- service role and the function below only
insert into public.fc_partner_codes (code, reseller) values
  ('HIRAM', 'hiram-diaz'),
  ('HIRAM-DIAZ', 'hiram-diaz')
on conflict (code) do update set reseller = excluded.reseller;

-- Called by the signed-in browser once, with the code it remembered. Returns:
--   'ok'        the account is now tagged to that reseller
--   'already'   the account already has a reseller (first one wins)
--   'invalid'   no such code
--   'too_late'  the account is older than 3 months or already pays for a plan
create or replace function public.fc_claim_referral(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare
  r text;
  p public.fc_profiles%rowtype;
begin
  if auth.uid() is null then return 'invalid'; end if;
  select reseller into r from public.fc_partner_codes where code = upper(trim(coalesce(p_code, '')));
  if r is null then return 'invalid'; end if;
  select * into p from public.fc_profiles where id = auth.uid() for update;
  if not found then return 'invalid'; end if;
  if p.referred_by is not null then return 'already'; end if;
  if p.created_at < now() - interval '3 months' or coalesce(p.plan, 'free') <> 'free' then return 'too_late'; end if;
  update public.fc_profiles set referred_by = r, referred_at = now() where id = p.id;
  return 'ok';
end $$;
revoke all on function public.fc_claim_referral(text) from public, anon;
grant execute on function public.fc_claim_referral(text) to authenticated;
