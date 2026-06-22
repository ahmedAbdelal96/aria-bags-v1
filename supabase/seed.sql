-- ============================================
-- ARIA Luxury Bags — Seed Data
-- Run AFTER schema.sql + migrations/005_add_handbag_fields.sql
-- ============================================

-- Reset categories for ARIA
TRUNCATE public.categories CASCADE;

INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Tote Bags', 'tote-bags', 'Spacious silhouettes crafted for everyday sophistication', 1),
  ('Crossbody', 'crossbody', 'Hands-free elegance for the modern woman', 2),
  ('Shoulder Bags', 'shoulder-bags', 'Refined shoulder companions with timeless appeal', 3),
  ('Clutches', 'clutches', 'Statement evening pieces for special moments', 4),
  ('Backpacks', 'backpacks', 'Contemporary luxury for life in motion', 5)
ON CONFLICT (slug) DO NOTHING;

TRUNCATE public.products CASCADE;

DO $$
DECLARE
  tote_id UUID;
  crossbody_id UUID;
  shoulder_id UUID;
  clutch_id UUID;
  backpack_id UUID;
BEGIN
  SELECT id INTO tote_id FROM public.categories WHERE slug = 'tote-bags';
  SELECT id INTO crossbody_id FROM public.categories WHERE slug = 'crossbody';
  SELECT id INTO shoulder_id FROM public.categories WHERE slug = 'shoulder-bags';
  SELECT id INTO clutch_id FROM public.categories WHERE slug = 'clutches';
  SELECT id INTO backpack_id FROM public.categories WHERE slug = 'backpacks';

  INSERT INTO public.products (
    category_id, name, slug, short_description, description,
    price, sale_price, image_url, images,
    colors, material, dimensions, care_instructions,
    status, is_featured, display_order
  ) VALUES
  (
    tote_id,
    'Onyx Classic Tote',
    'onyx-classic-tote',
    'A timeless black leather tote with refined gold-tone hardware.',
    'Crafted from full-grain Italian leather, the Onyx Classic Tote balances generous interior space with a sculpted silhouette. Designed in Cairo, finished by hand.',
    385.00, NULL,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80'],
    '[{"name": "Onyx Black", "hex": "#0B0B0B", "stock": 12}, {"name": "Camel", "hex": "#C8A57A", "stock": 6}, {"name": "Ivory", "hex": "#F1E7D2", "stock": 4}]'::jsonb,
    'Full-grain Italian leather',
    '38 × 30 × 14 cm',
    'Store in dust bag. Avoid prolonged direct sunlight.',
    'active', TRUE, 1
  ),
  (
    crossbody_id,
    'Luna Mini Crossbody',
    'luna-mini-crossbody',
    'A compact crescent silhouette in supple lambskin.',
    'The Luna Mini is an everyday crossbody with a sculpted crescent body, adjustable strap, and ARIA''s signature gold-tone clasp.',
    245.00, 215.00,
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1200&q=80'],
    '[{"name": "Midnight", "hex": "#0E1320", "stock": 8}, {"name": "Champagne", "hex": "#D7C29A", "stock": 5}]'::jsonb,
    'Lambskin leather',
    '22 × 16 × 7 cm',
    'Wipe gently with a soft, dry cloth. Avoid water and humidity.',
    'active', TRUE, 2
  ),
  (
    shoulder_id,
    'Aurora Shoulder Bag',
    'aurora-shoulder-bag',
    'Sculpted shoulder bag with chain-link strap detail.',
    'A signature ARIA silhouette, the Aurora pairs a sculpted body with a woven gold-tone chain strap for day-to-evening versatility.',
    425.00, NULL,
    'https://images.unsplash.com/photo-1590739293931-a4067b6c8864?w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1590739293931-a4067b6c8864?w=1200&q=80'],
    '[{"name": "Noir", "hex": "#0B0B0B", "stock": 10}, {"name": "Pearl", "hex": "#EDE6D3", "stock": 3}]'::jsonb,
    'Smooth calfskin',
    '30 × 22 × 9 cm',
    'Store in dust bag. Wipe gently with a soft, dry cloth.',
    'active', TRUE, 3
  ),
  (
    clutch_id,
    'Étoile Evening Clutch',
    'etoile-evening-clutch',
    'A refined envelope clutch finished with a custom gold clasp.',
    'The Étoile is an evening essential: a slim envelope body, magnetic gold-tone clasp, and removable wrist strap.',
    195.00, NULL,
    'https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=1200&q=80'],
    '[{"name": "Black", "hex": "#0B0B0B", "stock": 7}, {"name": "Burgundy", "hex": "#5C1A1B", "stock": 5}]'::jsonb,
    'Saffiano leather',
    '25 × 14 × 4 cm',
    'Avoid contact with sharp objects. Store flat in dust bag.',
    'active', FALSE, 4
  ),
  (
    backpack_id,
    'Mira City Backpack',
    'mira-city-backpack',
    'A modern city backpack in pebbled leather.',
    'The Mira is a refined take on the city backpack: pebbled leather, gold-tone hardware, and a convertible top handle.',
    365.00, NULL,
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80'],
    '[{"name": "Cognac", "hex": "#9A5B2A", "stock": 6}, {"name": "Onyx", "hex": "#0B0B0B", "stock": 9}]'::jsonb,
    'Pebbled calfskin',
    '32 × 28 × 12 cm',
    'Wipe gently with a soft, dry cloth. Avoid water.',
    'active', FALSE, 5
  ),
  (
    tote_id,
    'Sienna Structured Tote',
    'sienna-structured-tote',
    'A structured tote in warm tan leather with gold-tone feet.',
    'Sienna is built for the working day: a sculpted top handle, structured body, and signature ARIA feet.',
    345.00, NULL,
    'https://images.unsplash.com/photo-1590739225497-56c8b6d4b2f0?w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1590739225497-56c8b6d4b2f0?w=1200&q=80'],
    '[{"name": "Tan", "hex": "#B98A5A", "stock": 5}, {"name": "Black", "hex": "#0B0B0B", "stock": 8}]'::jsonb,
    'Smooth calfskin',
    '36 × 28 × 13 cm',
    'Store in dust bag. Avoid prolonged direct sunlight.',
    'active', FALSE, 6
  );
END $$;