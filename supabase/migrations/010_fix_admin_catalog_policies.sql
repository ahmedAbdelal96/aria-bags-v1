-- Forward-only migration to fix admin catalog policies.
-- Enable writes (INSERT, UPDATE, DELETE) and admin SELECT for authenticated admins only.

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Recreate function to ensure it exists and runs with SECURITY DEFINER
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

-- Categories Admin Policies
DROP POLICY IF EXISTS "Admin can read all categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON public.categories;

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

-- Products Admin Policies
DROP POLICY IF EXISTS "Admin can read all products" ON public.products;
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;

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

-- Store Settings Admin Write Policies
DROP POLICY IF EXISTS "Admin can read store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admin can insert store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admin can update store_settings" ON public.store_settings;

CREATE POLICY "Admin can read store_settings"
ON public.store_settings
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin can insert store_settings"
ON public.store_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin can update store_settings"
ON public.store_settings
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());
