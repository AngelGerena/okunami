-- OKUNAMI Studio brand briefs.
-- Every paid custom design gets a brief: a private link where the client sends their logo, photos, colors, vibe and
-- card content before Angel starts. Briefs are created automatically when a custom design is paid (card checkout on
-- a reseller card, or a Zelle/Apple Cash payment Angel confirms), and Angel can start one by hand from Admin > Studio.
-- Clients reach their brief only through the studio-brief edge function with the secret token. No direct table access.

create table if not exists public.fc_studio_briefs (
  id            uuid primary key default gen_random_uuid(),
  token         text not null unique default encode(extensions.gen_random_bytes(18), 'hex'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  lead_id       uuid unique references public.fc_reseller_leads(id) on delete set null,
  claim_id      bigint unique references public.fc_studio_claims(id) on delete set null,
  kind          text not null default 'card' check (kind in ('card', 'team')),
  status        text not null default 'waiting' check (status in ('waiting', 'submitted', 'building', 'preview', 'delivered')),
  name          text,
  email         text,
  phone         text,
  business      text,
  lang          text not null default 'en' check (lang in ('en', 'es')),
  reseller      text,
  answers       jsonb not null default '{}'::jsonb,
  files         jsonb not null default '[]'::jsonb,
  emailed_at    timestamptz,
  submitted_at  timestamptz,
  card_id       uuid references public.fc_cards(id) on delete set null,
  note          text
);
alter table public.fc_studio_briefs enable row level security;   -- no policies: server and admin functions only
create index if not exists fc_studio_briefs_status on public.fc_studio_briefs (status, created_at desc);

-- A paid custom design on a reseller card -> its brief.
create or replace function public.fc_studio_brief_from_lead() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.studio and new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    insert into public.fc_studio_briefs (lead_id, kind, name, email, phone, business, lang, reseller)
    values (new.id, case when new.plan = 'team' then 'team' else 'card' end, new.full_name, new.email, new.phone,
            new.business_name, case when new.lang = 'es' then 'es' else 'en' end, new.reseller)
    on conflict (lead_id) do nothing;
  end if;
  return new;
end $$;
drop trigger if exists fc_studio_brief_from_lead on public.fc_reseller_leads;
create trigger fc_studio_brief_from_lead after insert or update of status on public.fc_reseller_leads
  for each row execute function public.fc_studio_brief_from_lead();

-- A Founding 50 spot marked paid (card, or fc_studio_confirm_manual for Zelle/Apple Cash) -> its brief.
create or replace function public.fc_studio_brief_from_claim() returns trigger
language plpgsql security definer set search_path = public as $$
declare l public.fc_reseller_leads%rowtype;
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    if new.lead_id is not null then
      select * into l from public.fc_reseller_leads where id = new.lead_id;
      update public.fc_studio_briefs set claim_id = new.id where lead_id = new.lead_id and claim_id is null;
      if found then return new; end if;
      insert into public.fc_studio_briefs (lead_id, claim_id, kind, name, email, phone, business, lang, reseller)
      values (new.lead_id, new.id, 'card', l.full_name, l.email, l.phone, l.business_name, case when l.lang = 'es' then 'es' else 'en' end, coalesce(l.reseller, new.reseller))
      on conflict do nothing;
    else
      insert into public.fc_studio_briefs (claim_id, kind, email, reseller)
      values (new.id, 'card', case when new.email_key like '%@%' then new.email_key end, new.reseller)
      on conflict do nothing;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists fc_studio_brief_from_claim on public.fc_studio_claims;
create trigger fc_studio_brief_from_claim after insert or update of status on public.fc_studio_claims
  for each row execute function public.fc_studio_brief_from_claim();

-- Admin > Studio
create or replace function public.fc_admin_studio_briefs() returns setof public.fc_studio_briefs
language plpgsql security definer set search_path = public as $$
begin
  perform public.fc_require_admin();
  return query select * from public.fc_studio_briefs order by
    case status when 'submitted' then 0 when 'building' then 1 when 'preview' then 2 when 'waiting' then 3 else 4 end, created_at desc
    limit 200;
end $$;

-- A brief for a sale made by WhatsApp, in person or anywhere else.
create or replace function public.fc_admin_studio_brief_new(p_name text, p_email text, p_phone text, p_business text, p_lang text, p_kind text)
returns public.fc_studio_briefs
language plpgsql security definer set search_path = public as $$
declare b public.fc_studio_briefs;
begin
  perform public.fc_require_admin();
  insert into public.fc_studio_briefs (name, email, phone, business, lang, kind, emailed_at)
  values (nullif(trim(p_name), ''), nullif(lower(trim(p_email)), ''), nullif(trim(p_phone), ''), nullif(trim(p_business), ''),
          case when p_lang = 'es' then 'es' else 'en' end, case when p_kind = 'team' then 'team' else 'card' end,
          case when nullif(trim(p_email), '') is null then now() end)   -- no email: Angel sends the link himself
  returning * into b;
  return b;
end $$;

create or replace function public.fc_admin_studio_brief_set(p_id uuid, p_status text, p_card uuid, p_note text)
returns public.fc_studio_briefs
language plpgsql security definer set search_path = public as $$
declare b public.fc_studio_briefs;
begin
  perform public.fc_require_admin();
  update public.fc_studio_briefs set
    status = coalesce(p_status, status), card_id = coalesce(p_card, card_id), note = coalesce(p_note, note), updated_at = now()
  where id = p_id returning * into b;
  return b;
end $$;

revoke all on function public.fc_admin_studio_briefs() from public, anon;
revoke all on function public.fc_admin_studio_brief_new(text, text, text, text, text, text) from public, anon;
revoke all on function public.fc_admin_studio_brief_set(uuid, text, uuid, text) from public, anon;
grant execute on function public.fc_admin_studio_briefs() to authenticated;
grant execute on function public.fc_admin_studio_brief_new(text, text, text, text, text, text) to authenticated;
grant execute on function public.fc_admin_studio_brief_set(uuid, text, uuid, text) to authenticated;
