begin;

alter table if exists public.charger_transactions
    drop column if exists returned_to_member_id;

drop table if exists public.it_team_members cascade;

insert into public.admins (app_user_id)
select id
from public.app_users
where role = 'admin'
on conflict (app_user_id) do nothing;

notify pgrst, 'reload schema';
commit;
