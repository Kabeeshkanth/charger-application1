begin;

create or replace function public.require_return_details()
returns trigger
language plpgsql
as $$
begin
    if new.status = 'returned'
       and (
           new.returned_date is null
           or new.returned_time is null
           or nullif(trim(new.returned_person), '') is null
           or nullif(trim(new.returned_by_username), '') is null
       )
    then
        raise exception 'Returned records require return date, time, returned person, and returning username.';
    end if;

    return new;
end;
$$;

drop trigger if exists require_charger_return_details
on public.charger_transactions;

create trigger require_charger_return_details
before insert or update of status, returned_date, returned_time,
    returned_person, returned_by_username
on public.charger_transactions
for each row
execute function public.require_return_details();

drop trigger if exists require_phone_return_details
on public.phone_transactions;

create trigger require_phone_return_details
before insert or update of status, returned_date, returned_time,
    returned_person, returned_by_username
on public.phone_transactions
for each row
execute function public.require_return_details();

notify pgrst, 'reload schema';

commit;
