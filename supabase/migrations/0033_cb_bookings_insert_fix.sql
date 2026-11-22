-- Fix: booking requests from card visitors were always rejected.
-- The insert policy checked `card_slug in (select card_slug from cb_owners)`, but cb_owners has
-- RLS on with no read policy, so for visitors that subquery was always empty.
-- cb_card_exists runs as the owner (security definer) and only answers yes/no for a slug.
create or replace function public.cb_card_exists(p_slug text) returns boolean
language sql stable security definer set search_path to 'public', 'extensions' as $$
  select exists (select 1 from cb_owners where card_slug = p_slug)
$$;
revoke all on function public.cb_card_exists(text) from public;
grant execute on function public.cb_card_exists(text) to anon, authenticated;

drop policy if exists cb_bookings_anon_insert on public.cb_bookings;
create policy cb_bookings_anon_insert on public.cb_bookings for insert to anon, authenticated
  with check (public.cb_card_exists(card_slug) and status = 'new' and deleted_at is null
              and coalesce(length(message), 0) < 2000 and coalesce(length(visitor_name), 0) < 120);
