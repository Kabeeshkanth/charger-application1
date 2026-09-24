begin;

-- The application uses the Supabase publishable key and its own app_users
-- login RPC, so charger operations run as anon rather than auth.uid().

alter table public.chargers enable row level security;
alter table public.charger_transactions enable row level security;

drop policy if exists "Allow charger reads" on public.chargers;
create policy "Allow charger reads"
    on public.chargers
    for select
    using (true);

drop policy if exists "Allow charger inserts" on public.chargers;
create policy "Allow charger inserts"
    on public.chargers
    for insert
    with check (true);

drop policy if exists "Allow charger updates" on public.chargers;
create policy "Allow charger updates"
    on public.chargers
    for update
    using (true)
    with check (true);

drop policy if exists "Allow transaction reads" on public.charger_transactions;
create policy "Allow transaction reads"
    on public.charger_transactions
    for select
    using (true);

drop policy if exists "Allow transaction inserts" on public.charger_transactions;
create policy "Allow transaction inserts"
    on public.charger_transactions
    for insert
    with check (true);

drop policy if exists "Allow transaction updates" on public.charger_transactions;
create policy "Allow transaction updates"
    on public.charger_transactions
    for update
    using (true)
    with check (true);

notify pgrst, 'reload schema';

commit;
