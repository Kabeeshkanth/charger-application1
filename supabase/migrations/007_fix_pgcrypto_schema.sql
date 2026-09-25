begin;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.login_app_user(
    p_username text,
    p_password text
)
returns table (
    user_id bigint,
    username text,
    role text
)
language sql
security definer
set search_path = public
as $$
    select
        u.id as user_id,
        u.username,
        u.role
    from public.app_users u
    where lower(u.username) = lower(trim(p_username))
      and extensions.crypt(p_password, u.password_hash) = u.password_hash
      and u.is_active = true
    limit 1;
$$;

create or replace function public.create_app_user(
    p_username text,
    p_password text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if length(trim(p_username)) = 0 or length(p_password) = 0 then
        raise exception 'Username and password are required.';
    end if;

    insert into public.app_users (
        username,
        password_hash,
        role,
        is_active
    )
    values (
        trim(p_username),
        extensions.crypt(p_password, extensions.gen_salt('bf')),
        'user',
        true
    );
exception
    when unique_violation then
        raise exception 'That username already exists.';
end;
$$;

grant execute on function public.login_app_user(text, text)
to anon, authenticated;

grant execute on function public.create_app_user(text, text)
to anon, authenticated;

notify pgrst, 'reload schema';

commit;
