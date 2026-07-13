-- ============================================
-- ARIA Luxury Bags — Database Schema
-- Run this in your Supabase SQL Editor to set up
-- a fresh database for the ARIA handbag store.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (handbag model)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10, 2),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]'::jsonb,
  material TEXT,
  dimensions TEXT,
  care_instructions TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (physical handbag orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmation_token TEXT DEFAULT gen_random_uuid()::text UNIQUE,
  confirmation_attempts INTEGER DEFAULT 0 NOT NULL,
  last_contact_attempt_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending_confirmation'
    CHECK (status IN ('pending_confirmation', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returned')),
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipping_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  return_reason TEXT,
  internal_notes TEXT,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT DEFAULT 'cod',
  shipping_address JSONB,
  customer_name TEXT,
  -- Legacy compatibility columns kept nullable; guest checkout no longer requires them.
  customer_email TEXT,
  customer_phone TEXT,
  customer_phone_2 TEXT,
  shipping_city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items (each line captures the selected color at order time)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT,
  color_name TEXT,
  color_hex TEXT,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store settings (admin-configurable homepage copy)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_cta_label TEXT,
  hero_cta_url TEXT,
  promo_title TEXT,
  promo_description TEXT,
  promo_enabled BOOLEAN DEFAULT TRUE,
  featured_section_title TEXT,
  cta_title TEXT,
  cta_subtitle TEXT,
  cta_button_label TEXT,
  cta_button_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET views = views + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
