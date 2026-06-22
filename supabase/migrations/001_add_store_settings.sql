-- Migration: Add store_settings table
-- Run this in your Supabase SQL Editor

-- Create store_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hero_title TEXT DEFAULT 'Premium Digital Products, Delivered Instantly',
  hero_subtitle TEXT DEFAULT 'Browse thousands of digital resources, templates, guides, and downloadable products. Get instant access after purchase.',
  hero_cta_label TEXT DEFAULT 'Browse Products',
  hero_cta_url TEXT DEFAULT '/#featured',
  promo_title TEXT DEFAULT 'Ready to Get Started?',
  promo_description TEXT DEFAULT 'Browse our collection of premium digital products and find exactly what you need.',
  promo_enabled BOOLEAN DEFAULT TRUE,
  featured_section_title TEXT DEFAULT 'Featured Products',
  cta_title TEXT DEFAULT 'Ready to Get Started?',
  cta_subtitle TEXT DEFAULT 'Browse our collection of premium digital products.',
  cta_button_label TEXT DEFAULT 'Explore Products',
  cta_button_url TEXT DEFAULT '/',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings if table is empty
INSERT INTO public.store_settings (id)
SELECT uuid_generate_v4()
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings LIMIT 1);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_store_settings_updated_at ON public.store_settings;
CREATE OR REPLACE FUNCTION update_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION update_store_settings_updated_at();

-- Optional: Add display_order to categories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;
