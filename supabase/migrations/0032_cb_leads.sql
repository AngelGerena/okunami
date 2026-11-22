-- Lead funnel for card back offices (first used by emelyfelix).
-- Visitors never touch the table directly: they call cb_lead_submit (security definer),
-- which validates and rate-limits. Owners read and update through their session token,
-- the same way cb_bookings_list / cb_booking_update work.
-- Additive only: new table + new functions, nothing existing is changed.

create table if not exists public.cb_leads (
  id          bigserial primary key,
  card_slug   text not null,
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text,
  email       text,
  goal        text,
  answers     jsonb not null default '{}'::jsonb,
  wants_team  text,
  source      text,
  lang        text,
  consent     boolean not null default false,
  status      text not null default 'new' check (status in ('new','contacted','customer','team')),
  deleted_at  timestamptz
);
create index if not exists cb_leads_slug_created on public.cb_leads (card_slug, created_at desc);

alter table public.cb_leads enable row level security;
revoke all on public.cb_leads from anon, authenticated;
revoke all on sequence public.cb_leads_id_seq from anon, authenticated;

-- Public: a visitor finishes the quiz
create or replace function public.cb_lead_submit(
  p_slug text, p_name text, p_phone text, p_email text, p_goal text,
  p_answers jsonb, p_team text, p_source text, p_lang text, p_consent boolean)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_name  text := nullif(btrim(coalesce(p_name, '')), '');
  v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g'), '');
  v_email text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_id bigint;
begin
  if not exists (select 1 from cb_owners where card_slug = p_slug) then return jsonb_build_object('ok', false, 'error', 'card'); end if;
  if not coalesce(p_consent, false) then return jsonb_build_object('ok', false, 'error', 'consent'); end if;
  if v_name is null or length(v_name) > 120 then return jsonb_build_object('ok', false, 'error', 'name'); end if;
  if v_phone is not null and length(v_phone) not between 7 and 20 then v_phone := null; end if;
  if v_email is not null and (length(v_email) > 200 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then v_email := null; end if;
  if v_phone is null and v_email is null then return jsonb_build_object('ok', false, 'error', 'contact'); end if;
  if p_answers is not null and length(p_answers::text) > 4000 then return jsonb_build_object('ok', false, 'error', 'answers'); end if;

  -- light abuse limits: same contact 3x a day, 300 leads per card per hour
  if (select count(*) from cb_leads where card_slug = p_slug and created_at > now() - interval '1 day'
        and ((v_phone is not null and phone = v_phone) or (v_email is not null and email = v_email))) >= 3
     or (select count(*) from cb_leads where card_slug = p_slug and created_at > now() - interval '1 hour') >= 300 then
    return jsonb_build_object('ok', true, 'dup', true);
  end if;

  insert into cb_leads (card_slug, name, phone, email, goal, answers, wants_team, source, lang, consent)
  values (p_slug, v_name, v_phone, v_email, left(p_goal, 40), coalesce(p_answers, '{}'::jsonb),
          left(p_team, 20), left(nullif(btrim(coalesce(p_source, '')), ''), 80), left(p_lang, 5), true)
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

-- Owners: list their leads
create or replace function public.cb_leads_list(p_token text)
returns setof public.cb_leads
language plpgsql
stable security definer
set search_path to 'public', 'extensions'
as $$
declare w record;
begin
  select * into w from cb_who(p_token);
  if not found then raise exception 'not signed in'; end if;
  return query select * from cb_leads where card_slug = w.card_slug and deleted_at is null order by created_at desc limit 1000;
end $$;

-- Owners: move a lead along, or remove it
create or replace function public.cb_lead_update(p_token text, p_id bigint, p_status text, p_delete boolean default false)
returns void
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare w record;
begin
  select * into w from cb_who(p_token);
  if not found then raise exception 'not signed in'; end if;
  if p_delete then
    update cb_leads set deleted_at = now() where id = p_id and card_slug = w.card_slug;
    insert into cb_audit(card_slug, user_name, action) values (w.card_slug, w.name, 'removed lead ' || p_id);
  elsif p_status in ('new','contacted','customer','team') then
    update cb_leads set status = p_status where id = p_id and card_slug = w.card_slug;
    insert into cb_audit(card_slug, user_name, action) values (w.card_slug, w.name, 'marked lead ' || p_id || ' ' || p_status);
  end if;
end $$;

revoke all on function public.cb_lead_submit(text,text,text,text,text,jsonb,text,text,text,boolean) from public;
revoke all on function public.cb_leads_list(text) from public;
revoke all on function public.cb_lead_update(text,bigint,text,boolean) from public;
grant execute on function public.cb_lead_submit(text,text,text,text,text,jsonb,text,text,text,boolean) to anon, authenticated;
grant execute on function public.cb_leads_list(text) to anon, authenticated;
grant execute on function public.cb_lead_update(text,bigint,text,boolean) to anon, authenticated;
