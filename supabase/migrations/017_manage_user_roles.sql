begin;

create or replace function public.update_app_user_role(
    p_user_id bigint,
    p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_role not in ('user', 'admin') then
        raise exception 'Invalid user role.';
    end if;

    update public.app_users
    set role = p_role
    where id = p_user_id;

    if not found then
        raise exception 'User not found.';
    end if;

    if p_role = 'admin' then
        insert into public.admins (app_user_id)
        values (p_user_id)
        on conflict (app_user_id) do nothing;
    else
        delete from public.admins
        where app_user_id = p_user_id;
    end if;
end;
$$;

grant execute on function public.update_app_user_role(bigint, text)
to anon, authenticated;

notify pgrst, 'reload schema';
commit;
