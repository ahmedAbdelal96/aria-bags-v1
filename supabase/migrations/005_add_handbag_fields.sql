-- ============================================
-- ARIA Luxury Bags — Handbag product fields
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add handbag-specific columns to products (idempotent)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS material TEXT,
  ADD COLUMN IF NOT EXISTS dimensions TEXT,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT;

-- Migrate legacy status 'inactive' -> 'draft' for new model
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'products_status_check'
      AND table_name = 'products'
  ) THEN
    ALTER TABLE public.products DROP CONSTRAINT products_status_check;
  END IF;
END $$;

ALTER TABLE public.products
  ADD CONSTRAINT products_status_check
  CHECK (status IN ('active', 'draft', 'archived'));

-- Update existing rows to use the new status value
UPDATE public.products SET status = 'draft' WHERE status = 'inactive';

-- Add handbag-specific columns to order_items (idempotent)
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS color_name TEXT,
  ADD COLUMN IF NOT EXISTS color_hex TEXT;

-- Add handbag-specific columns to orders (idempotent)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Drop the demo_download column (no longer needed)
ALTER TABLE public.orders DROP COLUMN IF EXISTS demo_download;

-- Drop the digital-product-only columns from products (optional, non-destructive to leave)
-- Keeping them nullable for now so legacy data still loads; the customer UI hides them.
-- ALTER TABLE public.products
--   DROP COLUMN IF EXISTS file_url,
--   DROP COLUMN IF EXISTS file_size,
--   DROP COLUMN IF EXISTS file_type,
--   DROP COLUMN IF EXISTS is_instant_download,
--   DROP COLUMN IF EXISTS is_paid_product,
--   DROP COLUMN IF EXISTS download_file_path,
--   DROP COLUMN IF EXISTS file_size_bytes,
--   DROP COLUMN IF EXISTS downloads;