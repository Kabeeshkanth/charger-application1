begin;

create or replace function public.list_admin_users()
returns table(admin_id bigint, user_id bigint, username text)
language sql
security definer
set search_path = public
as $$
    select a.id, u.id, u.username
    from public.admins a
    join public.app_users u on u.id = a.app_user_id
    where u.role = 'admin'
      and u.is_active = true
    order by lower(u.username);
$$;

grant execute on function public.list_admin_users() to anon, authenticated;
notify pgrst, 'reload schema';
commit;
