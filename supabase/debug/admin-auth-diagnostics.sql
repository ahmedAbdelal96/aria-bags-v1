-- Replace with the real admin email before running.
-- Example:
--   \set admin_email 'admin@example.com'

-- 1. Auth + profile join
select
  u.id as auth_user_id,
  u.email as auth_email,
  u.email_confirmed_at,
  p.id as profile_id,
  p.email as profile_email,
  p.is_admin,
  pg_typeof(p.is_admin) as is_admin_type
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = lower('REPLACE_WITH_ADMIN_EMAIL');

-- 2. Profiles policies
select
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
order by policyname;

-- 3. RLS enabled
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'profiles';

-- 4. Profile count
select count(*) as profile_count
from public.profiles;
