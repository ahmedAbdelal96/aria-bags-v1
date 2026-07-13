-- Forward-only migration to restore admin visibility for orders and order_items.
-- This keeps guest checkout unchanged while making authenticated admin reads and
-- order lifecycle updates work through RLS.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = TRUE
  );
$$;

DROP POLICY IF EXISTS "Admin can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can read all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin can update order items" ON public.order_items;

CREATE POLICY "Admin can read all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can read all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (public.is_admin_user());

