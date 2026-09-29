begin;

alter table public.charger_transactions
    add column if not exists returned_by_username text,
    add column if not exists returned_to_admin_id bigint
        references public.app_users(id) on delete set null,
    add column if not exists approved_by_admin_id bigint
        references public.admins(id) on delete set null,
    add column if not exists approved_at timestamptz;

alter table public.charger_transactions
    drop constraint if exists charger_transactions_status_check;

alter table public.charger_transactions
    add constraint charger_transactions_status_check
    check (status = any (array['borrowed', 'return_pending', 'returned']));

insert into public.admins (app_user_id)
select id
from public.app_users
where role = 'admin'
on conflict (app_user_id) do nothing;

create or replace function public.approve_charger_return(
    p_transaction_id bigint,
    p_admin_user_id bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    transaction_record public.charger_transactions;
    admin_record public.admins;
begin
    select a.*
    into admin_record
    from public.admins a
    join public.app_users u on u.id = a.app_user_id
    where a.app_user_id = p_admin_user_id
      and u.role = 'admin'
      and u.is_active = true;

    if admin_record.id is null then
        raise exception 'Only an active admin can approve returns.';
    end if;

    select *
    into transaction_record
    from public.charger_transactions
    where id = p_transaction_id
      and status = 'return_pending'
      and returned_to_admin_id = p_admin_user_id
    for update;

    if transaction_record.id is null then
        raise exception 'This return is not assigned to you or is no longer pending.';
    end if;

    update public.charger_transactions
    set status = 'returned',
        approved_by_admin_id = admin_record.id,
        approved_at = now()
    where id = p_transaction_id;

    update public.chargers
    set status = 'available'
    where id = transaction_record.charger_id
      and status = 'borrowed';
end;
$$;

grant execute on function public.approve_charger_return(bigint, bigint)
to anon, authenticated;

notify pgrst, 'reload schema';
commit;
