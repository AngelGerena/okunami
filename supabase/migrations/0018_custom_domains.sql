-- Migration 0018: a card can live on a domain its owner already owns (vcard.theirsite.com).
-- Pro Plus and Business only. One domain per card.
--
-- How a domain moves through its life:
--   pending_payment  Domain Hookup or Register picked, waiting on Stripe checkout
--   requested        paid (or free on a yearly plan); Angel connects it for them
--   waiting_dns      do-it-yourself: waiting for the client's CNAME record
--   checking_ssl     record found; waiting for the https certificate
--   connected        live: the card answers on this domain
--   canceled         removed by the owner (or never paid)
-- The browser never writes this table directly. Owners use fc_domain_* functions;
-- the edge functions (service role) move the status along.

create table if not exists public.fc_card_domains (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.fc_cards(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  domain text not null,
  method text not null check (method in ('diy', 'hookup', 'register')),
  provider text,
  contact_phone text,
  status text not null default 'waiting_dns'
    check (status in ('pending_payment', 'requested', 'waiting_dns', 'checking_ssl', 'connected', 'canceled')),
  paid_cents int not null default 0,
  stripe_session_id text,
  last_check jsonb,
  last_checked_at timestamptz,
  connected_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fc_card_domains_domain_format check (domain ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$'),
  constraint fc_card_domains_not_ours check (domain !~ '(^|\.)(okunami\.pro|finessemedia\.pro|netlify\.app)$')
);
-- One live (not canceled) domain per card, and a domain can only belong to one card.
create unique index if not exists fc_card_domains_card_live on public.fc_card_domains(card_id) where status <> 'canceled';
create unique index if not exists fc_card_domains_domain_live on public.fc_card_domains(domain) where status <> 'canceled';
create index if not exists fc_card_domains_owner_idx on public.fc_card_domains(owner_id);

alter table public.fc_card_domains enable row level security;
drop policy if exists fc_card_domains_owner_read on public.fc_card_domains;
create policy fc_card_domains_owner_read on public.fc_card_domains for select using (owner_id = auth.uid() or public.fc_is_admin());

-- ---------------------------------------------------------------- owner functions
/** Plans that include a connected domain. Keep in step with DOMAIN_PLANS in src/lib/plans.ts. */
create or replace function public.fc_domain_allowed(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select plan in ('plus', 'team') from public.fc_profiles where id = p_user), false);
$$;

/** The caller's current domain for a card (or nothing). */
create or replace function public.fc_domain_for_card(p_card uuid) returns public.fc_card_domains
language sql stable security definer set search_path = public as $$
  select d.* from public.fc_card_domains d
  where d.card_id = p_card and d.owner_id = auth.uid() and d.status <> 'canceled'
  order by d.created_at desc limit 1;
$$;

/** Remove the caller's domain from a card. The okunami.pro link keeps working. */
create or replace function public.fc_domain_cancel(p_card uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.fc_card_domains set status = 'canceled', updated_at = now()
  where card_id = p_card and owner_id = auth.uid() and status <> 'canceled';
end $$;

grant execute on function public.fc_domain_for_card(uuid) to authenticated;
grant execute on function public.fc_domain_cancel(uuid) to authenticated;
revoke execute on function public.fc_domain_allowed(uuid) from anon, authenticated;

-- ---------------------------------------------------------------- public lookup by domain
/** The card that lives on a connected domain. Same shape as fc_public_card, plus the domain.
    A domain only works while its owner is on a plan that includes it. */
create or replace function public.fc_public_card_by_host(p_host text) returns jsonb
language sql stable security definer set search_path = public as $$
  select public.fc_public_card(c.slug) || jsonb_build_object('domain', d.domain)
  from public.fc_card_domains d
  join public.fc_cards c on c.id = d.card_id
  where d.domain = lower(regexp_replace(p_host, '^www\.', '')) and d.status = 'connected'
    and c.published and public.fc_domain_allowed(d.owner_id)
  limit 1;
$$;
grant execute on function public.fc_public_card_by_host(text) to anon, authenticated;

/** A card's connected domain, if any (so its QR code and Share button can use it). */
create or replace function public.fc_card_domain(p_slug text) returns text
language sql stable security definer set search_path = public as $$
  select d.domain from public.fc_card_domains d join public.fc_cards c on c.id = d.card_id
  where c.slug = p_slug and c.published and d.status = 'connected' and public.fc_domain_allowed(d.owner_id) limit 1;
$$;
grant execute on function public.fc_card_domain(text) to anon, authenticated;

-- ---------------------------------------------------------------- admin
create or replace function public.fc_admin_domains(p_limit int default 100)
returns table (id uuid, card_id uuid, slug text, owner_email text, full_name text, business text, domain text, method text, provider text,
               contact_phone text, status text, paid_cents int, last_check jsonb, last_checked_at timestamptz, connected_at timestamptz,
               admin_note text, created_at timestamptz, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.fc_require_admin();
  return query
    select d.id, d.card_id, c.slug, p.email, c.data->>'fullName', c.data->>'business', d.domain, d.method, d.provider,
           d.contact_phone, d.status, d.paid_cents, d.last_check, d.last_checked_at, d.connected_at, d.admin_note, d.created_at, d.updated_at
    from public.fc_card_domains d join public.fc_cards c on c.id = d.card_id left join public.fc_profiles p on p.id = d.owner_id
    where d.status <> 'canceled'
    order by (d.status = 'requested') desc, (d.status = 'connected') asc, d.created_at desc
    limit greatest(1, least(p_limit, 500));
end $$;

create or replace function public.fc_admin_domain_note(p_id uuid, p_note text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.fc_require_admin();
  update public.fc_card_domains set admin_note = nullif(trim(p_note), ''), updated_at = now() where id = p_id;
end $$;

grant execute on function public.fc_admin_domains(int) to authenticated;
grant execute on function public.fc_admin_domain_note(uuid, text) to authenticated;

notify pgrst, 'reload schema';
