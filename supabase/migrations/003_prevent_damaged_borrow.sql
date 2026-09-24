begin;

-- Enforce the rule at database level as well as in the client. This protects
-- the workflow even when borrow_charger is called directly.

create or replace function public.prevent_borrowing_damaged_charger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.status = 'borrowed'
       and coalesce(old.status, '') is distinct from 'borrowed'
       and exists (
           select 1
           from public.charger_damage_reports damage
           where damage.charger_id = new.id
             and damage.repair_status = 'pending'
       )
    then
        raise exception 'This charger is damaged and cannot be borrowed until it is repaired.';
    end if;

    return new;
end;
$$;

drop trigger if exists prevent_borrowing_damaged_charger_trigger
on public.chargers;

create trigger prevent_borrowing_damaged_charger_trigger
before update of status on public.chargers
for each row
execute function public.prevent_borrowing_damaged_charger();

notify pgrst, 'reload schema';

commit;
