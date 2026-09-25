begin;

create extension if not exists pgcrypto;

drop function if exists public.create_app_user(text, text);

create function public.create_app_user(
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
        crypt(p_password, gen_salt('bf')),
        'user',
        true
    );
exception
    when unique_violation then
        raise exception 'That username already exists.';
end;
$$;

grant execute on function public.create_app_user(text, text)
to anon, authenticated;

notify pgrst, 'reload schema';

commit;
