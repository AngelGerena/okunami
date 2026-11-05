-- Partner (reseller) dashboard at okunami.pro/socio: follow-up fields on leads, and PIN sign-in for resellers and the OKUNAMI admin.
alter table public.fc_reseller_leads
  add column if not exists follow_up date,
  add column if not exists last_contact timestamptz,
  add column if not exists partner_notes text,
  add column if not exists paid_at timestamptz;

-- Stamp when a lead becomes paid (card checkout, Zelle confirmed by the admin, or reconcile).
create or replace function public.fc_reseller_leads_paid_at() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') and new.paid_at is null then
    new.paid_at := now();
  end if;
  return new;
end $$;
drop trigger if exists fc_reseller_leads_paid_at on public.fc_reseller_leads;
create trigger fc_reseller_leads_paid_at before update on public.fc_reseller_leads
  for each row execute function public.fc_reseller_leads_paid_at();

-- PINs, stored hashed. who = a reseller slug (e.g. hiram-diaz) or 'admin'. Service role only (RLS on, no policies).
create table if not exists public.fc_partner_access (
  who text primary key,
  pin_hash text not null,
  commission_rate numeric not null default 0.40,
  updated_at timestamptz not null default now()
);
alter table public.fc_partner_access enable row level security;

-- Set or change a PIN:  select public.fc_set_partner_pin('hiram-diaz', '123456');
create or replace function public.fc_set_partner_pin(p_who text, p_pin text) returns text
language plpgsql security definer set search_path = public, extensions as $$
begin
  if coalesce(p_who, '') = '' then raise exception 'Who is this PIN for?'; end if;
  if length(coalesce(p_pin, '')) < 4 then raise exception 'The PIN needs at least 4 digits'; end if;
  insert into public.fc_partner_access (who, pin_hash) values (p_who, crypt(p_pin, gen_salt('bf')))
  on conflict (who) do update set pin_hash = excluded.pin_hash, updated_at = now();
  return 'PIN saved for ' || p_who;
end $$;
revoke all on function public.fc_set_partner_pin(text, text) from public, anon, authenticated;

create or replace function public.fc_partner_login(p_pin text) returns table (who text, pin_hash text, commission_rate numeric)
language sql security definer set search_path = public, extensions as $$
  select a.who, a.pin_hash, a.commission_rate from public.fc_partner_access a
  where a.pin_hash = crypt(coalesce(p_pin, ''), a.pin_hash)
  order by (a.who = 'admin') desc limit 1;
$$;
revoke all on function public.fc_partner_login(text) from public, anon, authenticated;
