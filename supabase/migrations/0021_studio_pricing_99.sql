-- Founding 50 now $99 (regular $149) for the custom card. Teams get a custom team design at $249,
-- which builds the first 3 staff cards; each extra person is $35. The team price has no founding discount.
update public.fc_offer_config
   set value = value || jsonb_build_object('price_cents', 9900, 'regular_cents', 14900)
 where key = 'studio_founding';

insert into public.fc_offer_config (key, value) values ('studio_team', jsonb_build_object(
  'price_cents', 24900, 'included_cards', 3, 'extra_card_cents', 3500
)) on conflict (key) do update set value = excluded.value;

create or replace function public.fc_studio_offer_status() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare cfg jsonb; team jsonb; taken int; ends timestamptz; open boolean;
begin
  select value into cfg from public.fc_offer_config where key = 'studio_founding';
  select value into team from public.fc_offer_config where key = 'studio_team';
  if cfg is null then return jsonb_build_object('configured', false, 'active', false); end if;
  taken := public.fc_studio_taken();
  ends := (cfg ->> 'ends_at')::timestamptz;
  open := (cfg ->> 'active')::boolean and taken < (cfg ->> 'spots')::int and (ends is null or now() < ends);
  return jsonb_build_object(
    'configured', true, 'active', open,
    'spots', (cfg ->> 'spots')::int, 'left', greatest((cfg ->> 'spots')::int - taken, 0),
    'price_cents', (cfg ->> 'price_cents')::int, 'regular_cents', (cfg ->> 'regular_cents')::int,
    'ends_at', cfg ->> 'ends_at',
    'current_cents', case when open then (cfg ->> 'price_cents')::int else (cfg ->> 'regular_cents')::int end,
    'team_cents', coalesce((team ->> 'price_cents')::int, 24900),
    'team_included', coalesce((team ->> 'included_cards')::int, 3),
    'team_extra_cents', coalesce((team ->> 'extra_card_cents')::int, 3500));
end $$;
grant execute on function public.fc_studio_offer_status() to anon, authenticated;
