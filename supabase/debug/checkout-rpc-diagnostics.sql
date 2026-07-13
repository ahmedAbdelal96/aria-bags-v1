-- Guest checkout RPC diagnostics
-- Safe read-only inspection of the live stored functions and order table shape.

select
  p.oid::regprocedure as function_signature,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('create_guest_order', 'get_guest_order_confirmation')
order by p.proname, p.oid::regprocedure::text;

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders'
order by ordinal_position;

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'order_items'
order by ordinal_position;
