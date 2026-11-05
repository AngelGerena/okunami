-- Founding 50: OKUNAMI Studio Signature card (custom design) at a founding price.
-- $149 instead of $249 for the first 50 customers, or until Dec 31, 2026 11:59 PM ET, whichever comes first.
-- Requires a Pro, Pro Plus or Business plan (enforced at checkout). One counter for okunami.pro and every reseller card.
--
-- Spots count when: paid, or held by an open checkout/Zelle/Apple Cash reservation that has not expired.
-- To change the offer later:  update public.fc_offer_config set value = value || '{"spots":75}' where key = 'studio_founding';

insert into public.fc_offer_config (key, value) values ('studio_founding', jsonb_build_object(
  'active', true,
  'spots', 50,
  'price_cents', 14900,
  'regular_cents', 24900,
  'ends_at', '2026-12-31T23:59:59-05:00',
  'reserve_minutes', 45,
  'manual_hold_hours', 72
)) on conflict (key) do nothing;

create table if not exists public.fc_studio_claims (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email_key text not null,
  source text not null default 'reseller',          -- reseller | site | manual
  reseller text,
  lead_id uuid,
  method text not null default 'card',              -- card | zelle | applecash | manual
  status text not null default 'reserved' check (status in ('reserved', 'paid', 'released')),
  checkout_session text,
  reserved_until timestamptz,
  paid_at timestamptz,
  note text
);
create index if not exists fc_studio_claims_status_idx on public.fc_studio_claims (status, reserved_until);
create index if not exists fc_studio_claims_session_idx on public.fc_studio_claims (checkout_session);
alter table public.fc_studio_claims enable row level security;
create policy "admins read studio claims" on public.fc_studio_claims for select
  using (exists (select 1 from public.fc_admins a where a.user_id = auth.uid()));

create or replace function public.fc_studio_taken() returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.fc_studio_claims
  where status = 'paid' or (status = 'reserved' and reserved_until > now());
$$;

-- Public: anyone (okunami.pro, reseller cards) can read the live status. Prices come only from here.
create or replace function public.fc_studio_offer_status() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare cfg jsonb; taken int; ends timestamptz; open boolean;
begin
  select value into cfg from public.fc_offer_config where key = 'studio_founding';
  if cfg is null then return jsonb_build_object('configured', false, 'active', false); end if;
  taken := public.fc_studio_taken();
  ends := (cfg ->> 'ends_at')::timestamptz;
  open := (cfg ->> 'active')::boolean and taken < (cfg ->> 'spots')::int and (ends is null or now() < ends);
  return jsonb_build_object(
    'configured', true, 'active', open,
    'spots', (cfg ->> 'spots')::int, 'left', greatest((cfg ->> 'spots')::int - taken, 0),
    'price_cents', (cfg ->> 'price_cents')::int, 'regular_cents', (cfg ->> 'regular_cents')::int,
    'ends_at', cfg ->> 'ends_at',
    'current_cents', case when open then (cfg ->> 'price_cents')::int else (cfg ->> 'regular_cents')::int end);
end $$;

-- Server only: hold a spot for a checkout or a Zelle/Apple Cash payment. Returns the price to charge.
create or replace function public.fc_studio_claim(p_email text, p_source text, p_reseller text, p_lead uuid, p_method text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare cfg jsonb; k text := public.fc_email_key(p_email); taken int; ex public.fc_studio_claims%rowtype;
        hold interval; ends timestamptz; new_id bigint;
begin
  if coalesce(auth.role(), '') <> 'service_role' and session_user not in ('postgres', 'supabase_admin') then raise exception 'Server only'; end if;
  perform pg_advisory_xact_lock(884433);
  select value into cfg from public.fc_offer_config where key = 'studio_founding';
  if cfg is null then return jsonb_build_object('granted', false, 'reason', 'inactive', 'price_cents', 24900); end if;
  ends := (cfg ->> 'ends_at')::timestamptz;
  if not (cfg ->> 'active')::boolean or (ends is not null and now() >= ends) then
    return jsonb_build_object('granted', false, 'reason', 'ended', 'price_cents', (cfg ->> 'regular_cents')::int);
  end if;
  hold := case when p_method in ('zelle', 'applecash') then make_interval(hours => coalesce((cfg ->> 'manual_hold_hours')::int, 72))
               else make_interval(mins => coalesce((cfg ->> 'reserve_minutes')::int, 45)) end;
  update public.fc_studio_claims set status = 'released' where status = 'reserved' and reserved_until <= now();
  -- same person again: reuse their hold instead of taking a second spot
  select * into ex from public.fc_studio_claims where email_key = k and status in ('reserved', 'paid') order by id limit 1;
  if found then
    if ex.status = 'paid' then return jsonb_build_object('granted', false, 'reason', 'already_claimed', 'price_cents', (cfg ->> 'regular_cents')::int); end if;
    update public.fc_studio_claims set reserved_until = now() + hold, method = p_method, lead_id = coalesce(p_lead, lead_id) where id = ex.id;
    return jsonb_build_object('granted', true, 'reason', 'reused', 'claim_id', ex.id, 'price_cents', (cfg ->> 'price_cents')::int);
  end if;
  taken := public.fc_studio_taken();
  if taken >= (cfg ->> 'spots')::int then return jsonb_build_object('granted', false, 'reason', 'sold_out', 'price_cents', (cfg ->> 'regular_cents')::int); end if;
  insert into public.fc_studio_claims (email_key, source, reseller, lead_id, method, status, reserved_until)
    values (k, coalesce(p_source, 'reseller'), p_reseller, p_lead, coalesce(p_method, 'card'), 'reserved', now() + hold)
    returning id into new_id;
  return jsonb_build_object('granted', true, 'reason', 'reserved', 'claim_id', new_id, 'price_cents', (cfg ->> 'price_cents')::int);
end $$;

create or replace function public.fc_studio_attach(p_claim bigint, p_session text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' and session_user not in ('postgres', 'supabase_admin') then raise exception 'Server only'; end if;
  update public.fc_studio_claims set checkout_session = p_session where id = p_claim;
end $$;

-- Paid by card (called from the Stripe webhook and from the return page). Safe to call twice.
create or replace function public.fc_studio_mark_paid(p_session text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' and session_user not in ('postgres', 'supabase_admin') then raise exception 'Server only'; end if;
  update public.fc_studio_claims set status = 'paid', paid_at = now()
  where checkout_session = p_session and status <> 'paid';
  return found;
end $$;

-- Angel confirms a Zelle or Apple Cash payment, or records a sale made in person:
--   select public.fc_studio_confirm_manual('client@email.com', 'Zelle received Oct 20');
create or replace function public.fc_studio_confirm_manual(p_email text, p_note text default null) returns text
language plpgsql security definer set search_path = public as $$
declare k text := public.fc_email_key(p_email); cid bigint;
begin
  if not (coalesce(auth.role(), '') = 'service_role' or session_user in ('postgres', 'supabase_admin') or public.fc_is_admin()) then raise exception 'Admins only'; end if;
  select id into cid from public.fc_studio_claims where email_key = k and status = 'reserved' order by id desc limit 1;
  if cid is not null then
    update public.fc_studio_claims set status = 'paid', paid_at = now(), note = coalesce(p_note, note) where id = cid;
    return 'Marked paid: claim ' || cid;
  end if;
  insert into public.fc_studio_claims (email_key, source, method, status, paid_at, note)
    values (k, 'manual', 'manual', 'paid', now(), p_note) returning id into cid;
  return 'Recorded a new paid spot: claim ' || cid;
end $$;

grant execute on function public.fc_studio_offer_status() to anon, authenticated;

alter table public.fc_reseller_leads add column if not exists studio boolean not null default false;
alter table public.fc_reseller_leads add column if not exists studio_cents int;
