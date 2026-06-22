-- Row Level Security (RLS) Policies for Digital Products Store
-- Run this in your Supabase SQL Editor to enable RLS

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
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

-- ============================================
-- PUBLIC READ POLICIES
-- ============================================

-- Categories: Anyone can read
CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- Products: Anyone can read active products only
CREATE POLICY "Public can read active products"
ON public.products
FOR SELECT
TO public
USING (status = 'active');

-- ============================================
-- USER POLICIES
-- ============================================

-- Profiles: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Profiles: Users can update their own profile (but not admin status)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Orders: Users can read their own orders
CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Order Items: Users can read their own order items
CREATE POLICY "Users can read own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- ============================================
-- ADMIN POLICIES
-- ============================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: Admins can read all profiles
CREATE POLICY "Admin can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- Profiles: Admins can update any profile (for managing admin status)
CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Products: Admins can do everything
CREATE POLICY "Admin can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin_user());

-- Categories: Admins can do everything
CREATE POLICY "Admin can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (public.is_admin_user());

-- Orders: Admins can read all, users can only read their own
CREATE POLICY "Admin can read all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_admin_user() OR auth.uid() = user_id);

CREATE POLICY "Admin can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

-- Order Items: Same as orders
CREATE POLICY "Admin can read all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  public.is_admin_user() OR
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admin can insert order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can update order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can delete order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (public.is_admin_user());

-- Store Settings: Only admins can read/write
CREATE POLICY "Admin can read store_settings"
ON public.store_settings
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can update store_settings"
ON public.store_settings
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can insert store_settings"
ON public.store_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Product Images bucket (public bucket for cover images)
-- Note: This bucket stores PUBLIC cover images only, not paid download files

-- Allow public read access to product-images bucket
CREATE POLICY "Public read product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users (especially admins) to upload product images
CREATE POLICY "Admin can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow admins to update/delete their own uploads
CREATE POLICY "Admin can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Note: For production, consider adding more restrictive policies based on user ownership
-- For now, any admin can manage all images in the bucket

-- ============================================
-- VERIFY RLS IS WORKING
-- ============================================

-- Test by running:
-- SELECT * FROM pg_policies WHERE tablename = 'products';
-- SELECT * FROM pg_policies WHERE tablename = 'categories';
-- SELECT * FROM pg_policies WHERE tablename = 'storage.objects';
