begin;

alter table public.charger_transactions
    drop column if exists returned_to_member_id;

drop table if exists public.it_team_members cascade;

notify pgrst, 'reload schema';
commit;
