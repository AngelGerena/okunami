-- Migration 0028: Pro Plus done-for-you edits.
-- A Pro Plus member can ask Finesse Media for up to 2 small edits a month (hours, photos, prices, links, text).
-- The month runs on Eastern time and unused edits do not roll over. A request Angel declines as "not a small
-- edit" (quoted as Studio work instead) does not count toward the 2.
--
-- Statuses: open (waiting on Angel) -> done | declined.
-- The browser never writes this table. The okunami-edits edge function (service role) inserts through
-- fc_edit_submit, which enforces the plan and the monthly limit; admins read and update through fc_admin_* functions.

create table if not exists public.fc_edit_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid references public.fc_cards(id) on delete set null,
  details text not null check (char_length(details) between 3 and 1500),
  photo_url text check (photo_url is null or char_length(photo_url) <= 600),
  period text not null check (period ~ '^\d{4}-\d{2}$'),
  status text not null default 'open' check (status in ('open', 'done', 'declined')),
  lang text not null default 'en' check (lang in ('en', 'es')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 500),
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fc_edit_requests_owner_period on public.fc_edit_requests(owner_id, period);
create index if not exists fc_edit_requests_status on public.fc_edit_requests(status, created_at desc);

alter table public.fc_edit_requests enable row level security;
drop policy if exists fc_edit_requests_read on public.fc_edit_requests;
create policy fc_edit_requests_read on public.fc_edit_requests for select using (owner_id = auth.uid() or public.fc_is_admin());
-- Members and admins read through the functions below, so Angel's private notes never reach the browser directly.
revoke all on public.fc_edit_requests from anon, authenticated;

/** Edits included per month on Pro Plus. Keep in step with EDITS_PER_MONTH in src/lib/edits.ts. */
create or replace function public.fc_edit_limit() returns int language sql immutable as $$ select 2 $$;

/** The current edit month, on Eastern time ('2026-11'). */
create or replace function public.fc_edit_period() returns text language sql stable as $$
  select to_char(now() at time zone 'America/New_York', 'YYYY-MM');
$$;

/** The caller's edits this month: whether their plan includes them, how many are used, and their recent requests. */
create or replace function public.fc_edits_status() returns jsonb
language sql stable security definer set search_path = public as $$
  with me as (select coalesce((select plan from public.fc_profiles where id = auth.uid()), 'free') as plan),
       used as (select count(*)::int as n from public.fc_edit_requests
                where owner_id = auth.uid() and period = public.fc_edit_period() and status <> 'declined')
  select jsonb_build_object(
    'allowed', (select plan = 'plus' from me),
    'limit', public.fc_edit_limit(),
    'used', (select n from used),
    'period', public.fc_edit_period(),
    'resets_on', to_char((date_trunc('month', now() at time zone 'America/New_York') + interval '1 month')::date, 'YYYY-MM-DD'),
    'recent', coalesce((
      select jsonb_agg(r order by r.created_at desc) from (
        select e.id, e.details, e.photo_url, e.status, e.created_at, e.done_at, e.card_id,   -- admin_note stays private
               c.data->>'fullName' as card_name
        from public.fc_edit_requests e left join public.fc_cards c on c.id = e.card_id
        where e.owner_id = auth.uid() order by e.created_at desc limit 8
      ) r), '[]'::jsonb)
  );
$$;
grant execute on function public.fc_edits_status() to authenticated;

/** Service role only (okunami-edits). Saves a request if the member is on Pro Plus and has an edit left this month. */
create or replace function public.fc_edit_submit(p_user uuid, p_card uuid, p_details text, p_photo text, p_lang text default 'en')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_plan text;
  v_used int;
  v_period text := public.fc_edit_period();
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('fc_edit:' || p_user::text));   -- two taps at once can't both slip under the limit
  select plan into v_plan from public.fc_profiles where id = p_user;
  if coalesce(v_plan, 'free') <> 'plus' then return jsonb_build_object('error', 'not_plus'); end if;
  if p_card is not null and not exists (select 1 from public.fc_cards where id = p_card and owner_id = p_user) then
    return jsonb_build_object('error', 'not_your_card');
  end if;
  select count(*) into v_used from public.fc_edit_requests where owner_id = p_user and period = v_period and status <> 'declined';
  if v_used >= public.fc_edit_limit() then return jsonb_build_object('error', 'limit', 'used', v_used); end if;
  insert into public.fc_edit_requests (owner_id, card_id, details, photo_url, period, lang)
  values (p_user, p_card, left(trim(p_details), 1500), nullif(trim(coalesce(p_photo, '')), ''), v_period, case when p_lang = 'es' then 'es' else 'en' end)
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'used', v_used + 1, 'limit', public.fc_edit_limit());
end $$;
revoke execute on function public.fc_edit_submit(uuid, uuid, text, text, text) from public, anon, authenticated;

/* ---------------------------------------------------------------- admin */
create or replace function public.fc_admin_edits(p_limit int default 100)
returns table (id uuid, owner_id uuid, owner_email text, owner_name text, card_id uuid, slug text, card_name text, business text,
               details text, photo_url text, period text, status text, admin_note text, done_at timestamptz, created_at timestamptz,
               used_this_month int)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.fc_require_admin();
  return query
    select e.id, e.owner_id, p.email, p.full_name, e.card_id, c.slug, c.data->>'fullName', c.data->>'business',
           e.details, e.photo_url, e.period, e.status, e.admin_note, e.done_at, e.created_at,
           (select count(*)::int from public.fc_edit_requests x where x.owner_id = e.owner_id and x.period = e.period and x.status <> 'declined')
    from public.fc_edit_requests e
    left join public.fc_profiles p on p.id = e.owner_id
    left join public.fc_cards c on c.id = e.card_id
    order by (e.status = 'open') desc, e.created_at desc
    limit greatest(1, least(p_limit, 500));
end $$;

create or replace function public.fc_admin_edit_note(p_id uuid, p_note text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.fc_require_admin();
  update public.fc_edit_requests set admin_note = nullif(left(trim(p_note), 500), ''), updated_at = now() where id = p_id;
end $$;

grant execute on function public.fc_admin_edits(int) to authenticated;
grant execute on function public.fc_admin_edit_note(uuid, text) to authenticated;

notify pgrst, 'reload schema';
