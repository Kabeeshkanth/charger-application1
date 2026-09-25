begin;

create or replace function public.delete_app_user(
    p_user_id bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if exists (
        select 1
        from public.app_users
        where id = p_user_id
          and role = 'admin'
    ) then
        raise exception 'Admin accounts cannot be deleted.';
    end if;

    delete from public.app_users
    where id = p_user_id
      and role = 'user';
end;
$$;

grant execute on function public.delete_app_user(bigint)
to anon, authenticated;

notify pgrst, 'reload schema';

commit;
