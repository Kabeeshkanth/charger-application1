begin;

alter table public.chargers enable row level security;

drop policy if exists "Allow charger deletes" on public.chargers;
create policy "Allow charger deletes"
    on public.chargers
    for delete
    using (true);

notify pgrst, 'reload schema';

commit;
