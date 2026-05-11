-- GarageOS RLS baseline policies
-- Assumptions based on app code:
-- - profiles.id == auth.uid()
-- - customers.owner_id, cars.owner_id, jobs.owner_id, invoices.owner_id == auth.uid()
-- - invoices.job_id references jobs.id; jobs.customer_id references customers.id; jobs.car_id references cars.id
--
-- Apply this in the Supabase SQL editor. It is safe to re-run.

-- Enable RLS on all tables (public schema).
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.cars enable row level security;
alter table public.jobs enable row level security;
alter table public.invoices enable row level security;

-- Drop existing policies with the same names (idempotent).
do $$ begin
  drop policy if exists "profiles_select_own" on public.profiles;
  drop policy if exists "profiles_insert_own" on public.profiles;
  drop policy if exists "profiles_update_own" on public.profiles;
  drop policy if exists "profiles_delete_own" on public.profiles;

  drop policy if exists "customers_select_own" on public.customers;
  drop policy if exists "customers_insert_own" on public.customers;
  drop policy if exists "customers_update_own" on public.customers;
  drop policy if exists "customers_delete_own" on public.customers;

  drop policy if exists "cars_select_own" on public.cars;
  drop policy if exists "cars_insert_own" on public.cars;
  drop policy if exists "cars_update_own" on public.cars;
  drop policy if exists "cars_delete_own" on public.cars;

  drop policy if exists "jobs_select_own" on public.jobs;
  drop policy if exists "jobs_insert_own" on public.jobs;
  drop policy if exists "jobs_update_own" on public.jobs;
  drop policy if exists "jobs_delete_own" on public.jobs;

  drop policy if exists "invoices_select_own" on public.invoices;
  drop policy if exists "invoices_insert_own" on public.invoices;
  drop policy if exists "invoices_update_own" on public.invoices;
  drop policy if exists "invoices_delete_own" on public.invoices;
end $$;

-- PROFILES (id matches auth.uid())
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (id = auth.uid());

-- CUSTOMERS (owner_id)
create policy "customers_select_own"
on public.customers
for select
to authenticated
using (owner_id = auth.uid());

create policy "customers_insert_own"
on public.customers
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "customers_update_own"
on public.customers
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "customers_delete_own"
on public.customers
for delete
to authenticated
using (owner_id = auth.uid());

-- CARS (owner_id)
create policy "cars_select_own"
on public.cars
for select
to authenticated
using (owner_id = auth.uid());

create policy "cars_insert_own"
on public.cars
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "cars_update_own"
on public.cars
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "cars_delete_own"
on public.cars
for delete
to authenticated
using (owner_id = auth.uid());

-- JOBS (owner_id)
create policy "jobs_select_own"
on public.jobs
for select
to authenticated
using (owner_id = auth.uid());

create policy "jobs_insert_own"
on public.jobs
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "jobs_update_own"
on public.jobs
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "jobs_delete_own"
on public.jobs
for delete
to authenticated
using (owner_id = auth.uid());

-- INVOICES (owner_id)
create policy "invoices_select_own"
on public.invoices
for select
to authenticated
using (owner_id = auth.uid());

create policy "invoices_insert_own"
on public.invoices
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "invoices_update_own"
on public.invoices
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "invoices_delete_own"
on public.invoices
for delete
to authenticated
using (owner_id = auth.uid());

