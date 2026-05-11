-- BayDesk RLS audit
-- Run this in the Supabase SQL editor to see current RLS status + policies.

-- 1) RLS enabled?
select
  n.nspname as schema,
  c.relname as table,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('profiles', 'customers', 'cars', 'jobs', 'invoices')
order by c.relname;

-- 2) Current policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'customers', 'cars', 'jobs', 'invoices')
order by tablename, policyname, cmd;

