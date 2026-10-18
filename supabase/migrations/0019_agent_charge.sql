-- Atomic spend for the agent service. Only the service role can call it.
-- Locks the account row, checks balance and the owner's daily cap, then writes one ledger row.
-- Returns true when the amount was reserved, false when the agent must not run.
create or replace function ag_charge(p_account uuid, p_amount bigint, p_ref text, p_kind text default 'usage')
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_balance bigint;
  v_cap bigint;
  v_spent bigint;
begin
  if p_amount <= 0 then return true; end if;
  select balance_micros, daily_cap_micros into v_balance, v_cap
    from ag_accounts where id = p_account for update;
  if not found then return false; end if;
  if v_balance < p_amount then return false; end if;
  if v_cap is not null then
    select coalesce(sum(-amount_micros), 0) into v_spent
      from ag_ledger
     where account_id = p_account
       and kind in ('usage','refund')
       and created_at >= date_trunc('day', now() at time zone 'America/New_York') at time zone 'America/New_York';
    if v_spent + p_amount > v_cap then return false; end if;
  end if;
  insert into ag_ledger (account_id, kind, amount_micros, ref) values (p_account, p_kind, -p_amount, p_ref);
  return true;
end $$;

revoke all on function ag_charge(uuid, bigint, text, text) from public, anon, authenticated;
grant execute on function ag_charge(uuid, bigint, text, text) to service_role;
