-- ARIA public read diagnostics
-- Safe, SELECT-only checks for diagnosing storefront visibility.

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('categories', 'products', 'orders', 'order_items')
order by c.relname;

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
  and tablename in ('categories', 'products', 'orders', 'order_items')
order by tablename, policyname;

set local role anon;

select count(*) as anon_categories_count
from public.categories;

select count(*) as anon_products_count
from public.products;

select count(*) as anon_active_products_count
from public.products
where status = 'active';

select id, name, slug
from public.categories
where slug = 'tote-bags';

reset role;
