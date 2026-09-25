begin;

create or replace function public.list_app_users()
returns table(user_id bigint, username text, role text)
language sql
security definer
set search_path = public
as $$
  select id, username, role
  from public.app_users
  order by username;
$$;

create or replace function public.update_app_user(
  p_user_id bigint,
  p_username text,
  p_password text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(trim(p_username)) = 0 then
    raise exception 'Username is required.';
  end if;

  if p_password is null or length(p_password) = 0 then
    update public.app_users set username = trim(p_username) where id = p_user_id;
  else
    update public.app_users
    set username = trim(p_username),
        password_hash = extensions.crypt(p_password, extensions.gen_salt('bf'))
    where id = p_user_id;
  end if;
exception
  when unique_violation then
    raise exception 'That username already exists.';
end;
$$;

grant execute on function public.list_app_users() to anon, authenticated;
grant execute on function public.update_app_user(bigint, text, text) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
