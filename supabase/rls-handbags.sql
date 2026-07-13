-- ARIA handbags RLS policies
-- Run this in Supabase SQL Editor after the schema is in place.
--
-- Guest checkout is handled through SECURITY DEFINER RPC functions:
--   public.create_guest_order(...)
--   public.get_guest_order_confirmation(...)
-- This keeps direct anonymous writes to orders/order_items disabled.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin can read all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
DROP POLICY IF EXISTS "Admin can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can read store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admin can update store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admin can insert store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;

DROP FUNCTION IF EXISTS public.is_admin_user();

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_admin = TRUE
  );
$$;

CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can read active products"
ON public.products
FOR SELECT
TO public
USING (status = 'active');

CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create order items for own orders"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admin can read all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can read all products"
ON public.products
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can read all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (public.is_admin_user());

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

CREATE POLICY "Admin can read store_settings"
ON public.store_settings
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can update store_settings"
ON public.store_settings
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can insert store_settings"
ON public.store_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Public read product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admin can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.is_admin_user());

CREATE POLICY "Admin can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin_user())
WITH CHECK (bucket_id = 'product-images' AND public.is_admin_user());

CREATE POLICY "Admin can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin_user());
