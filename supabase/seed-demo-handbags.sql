-- ============================================
-- ARIA Demo Handbags Seed
-- Safe for local/dev use.
-- Idempotent where practical: categories and products are upserted by slug.
-- This file does not truncate or delete existing data.
-- ============================================

INSERT INTO public.categories (name, slug, description, display_order)
VALUES
  ('New Arrivals', 'new-arrivals', 'Fresh ARIA launches and best-in-show pieces.', 1),
  ('Everyday Bags', 'everyday-bags', 'Easy carry silhouettes for daily use.', 2),
  ('Work Bags', 'work-bags', 'Structured shapes for office days and busy schedules.', 3),
  ('Evening Bags', 'evening-bags', 'Smaller occasion pieces with a polished finish.', 4),
  ('Crossbody Bags', 'crossbody-bags', 'Hands-free styles for errands and travel.', 5),
  ('Tote Bags', 'tote-bags', 'Roomy carryalls for work, shopping, and weekends.', 6),
  ('Shoulder Bags', 'shoulder-bags', 'Soft, wearable silhouettes with timeless lines.', 7)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

WITH product_seed (
  category_slug,
  name,
  slug,
  short_description,
  description,
  price,
  sale_price,
  image_url,
  images,
  colors,
  material,
  dimensions,
  care_instructions,
  status,
  is_featured,
  display_order
) AS (
  VALUES
    (
      'tote-bags',
      'ARIA Classic Tote Bag',
      'aria-classic-tote-bag',
      'A polished everyday tote with room for work, errands, and weekend plans.',
      'The ARIA Classic Tote Bag is the MVP workhorse in the handbag lineup: structured, elegant, and spacious enough for a laptop, wallet, and all the daily extras without feeling bulky.',
      385.00,
      355.00,
      '/seed/handbags/aria-classic-tote.webp',
      ARRAY['/seed/handbags/aria-classic-tote.webp']::text[],
      $$[
        {"name":"Black","hex":"#111111","stock":8},
        {"name":"Beige","hex":"#D8C7AE","stock":4},
        {"name":"Ivory","hex":"#F4EBDD","stock":0},
        {"name":"Caramel","hex":"#B57A4A","stock":5}
      ]$$::jsonb,
      'Faux leather',
      '38 x 28 x 14 cm',
      'Store upright in a dust bag. Wipe clean with a soft dry cloth.',
      'active',
      TRUE,
      1
    ),
    (
      'shoulder-bags',
      'ARIA Soft Shoulder Bag',
      'aria-soft-shoulder-bag',
      'An easy shoulder bag with a relaxed profile and soft structure.',
      'Made for day-to-night wear, the ARIA Soft Shoulder Bag balances comfort and polish with an easy shape, a comfortable strap drop, and enough structure to hold its form.',
      295.00,
      NULL,
      '/seed/handbags/aria-soft-shoulder.webp',
      ARRAY['/seed/handbags/aria-soft-shoulder.webp']::text[],
      $$[
        {"name":"Taupe","hex":"#9A8472","stock":7},
        {"name":"Nude","hex":"#C89A84","stock":5},
        {"name":"Cream","hex":"#F5ECDC","stock":3}
      ]$$::jsonb,
      'Pebbled faux leather',
      '31 x 22 x 10 cm',
      'Avoid prolonged direct sunlight. Keep hardware dry after cleaning.',
      'active',
      FALSE,
      2
    ),
    (
      'crossbody-bags',
      'ARIA Mini Crossbody Bag',
      'aria-mini-crossbody-bag',
      'A compact crossbody for the essentials, with a clean and modern finish.',
      'The ARIA Mini Crossbody Bag keeps things light and tidy. It is sized for the phone, keys, cards, and lipstick, making it perfect for quick city days and evenings out.',
      165.00,
      NULL,
      '/seed/handbags/aria-mini-crossbody.webp',
      ARRAY['/seed/handbags/aria-mini-crossbody.webp']::text[],
      $$[
        {"name":"Black","hex":"#111111","stock":1},
        {"name":"Caramel","hex":"#B57A4A","stock":1},
        {"name":"Beige","hex":"#D8C7AE","stock":0}
      ]$$::jsonb,
      'Soft faux leather',
      '20 x 13 x 6 cm',
      'Wipe gently and keep away from sharp objects.',
      'active',
      FALSE,
      3
    ),
    (
      'evening-bags',
      'ARIA Evening Clutch',
      'aria-evening-clutch',
      'A refined clutch for events, dinners, and special nights out.',
      'The ARIA Evening Clutch is a sleek occasion piece with a slim profile, polished hardware, and just enough room for the essentials.',
      185.00,
      NULL,
      '/seed/handbags/aria-evening-clutch.webp',
      ARRAY['/seed/handbags/aria-evening-clutch.webp']::text[],
      $$[
        {"name":"Black","hex":"#111111","stock":6},
        {"name":"Burgundy","hex":"#6B2333","stock":4},
        {"name":"Ivory","hex":"#F4EBDD","stock":2}
      ]$$::jsonb,
      'Smooth faux leather',
      '26 x 14 x 4 cm',
      'Store flat in the dust bag after use. Avoid overfilling.',
      'active',
      TRUE,
      4
    ),
    (
      'everyday-bags',
      'ARIA Everyday Hobo Bag',
      'aria-everyday-hobo-bag',
      'A relaxed hobo silhouette with easy wear and a roomy interior.',
      'The ARIA Everyday Hobo Bag is the kind of piece customers reach for constantly: soft, comfortable on the shoulder, and roomy enough for all-day carry.',
      275.00,
      NULL,
      '/seed/handbags/aria-everyday-hobo.webp',
      ARRAY['/seed/handbags/aria-everyday-hobo.webp']::text[],
      $$[
        {"name":"Brown","hex":"#6B4F3A","stock":5},
        {"name":"Olive","hex":"#6B7A45","stock":3},
        {"name":"Cream","hex":"#F5ECDC","stock":2},
        {"name":"Nude","hex":"#C89A84","stock":1}
      ]$$::jsonb,
      'Textured faux leather',
      '34 x 27 x 11 cm',
      'Use a soft cloth and store with paper inside to hold shape.',
      'active',
      FALSE,
      5
    ),
    (
      'work-bags',
      'ARIA Work Satchel',
      'aria-work-satchel',
      'A structured satchel built for meetings, commutes, and office days.',
      'The ARIA Work Satchel is designed to look sharp without being fussy. It is clean, practical, and easy to style with both polished and casual outfits.',
      340.00,
      315.00,
      '/seed/handbags/aria-work-satchel.webp',
      ARRAY['/seed/handbags/aria-work-satchel.webp']::text[],
      $$[
        {"name":"Black","hex":"#111111","stock":7},
        {"name":"Taupe","hex":"#9A8472","stock":2},
        {"name":"Brown","hex":"#6B4F3A","stock":2}
      ]$$::jsonb,
      'Structured faux leather',
      '35 x 25 x 12 cm',
      'Keep the satchel away from moisture and store with the flap closed.',
      'active',
      TRUE,
      6
    ),
    (
      'evening-bags',
      'ARIA Quilted Chain Bag',
      'aria-quilted-chain-bag',
      'A quilted chain bag with a dressier finish for nights out.',
      'The ARIA Quilted Chain Bag brings a little glamour without becoming overcomplicated. It pairs a chain strap with a softly structured quilted body.',
      325.00,
      NULL,
      '/seed/handbags/aria-quilted-chain.webp',
      ARRAY['/seed/handbags/aria-quilted-chain.webp']::text[],
      $$[
        {"name":"Ivory","hex":"#F4EBDD","stock":4},
        {"name":"Nude","hex":"#C89A84","stock":3},
        {"name":"Burgundy","hex":"#6B2333","stock":1}
      ]$$::jsonb,
      'Quilted faux leather',
      '28 x 18 x 8 cm',
      'Avoid scratching the quilted surface and wipe with a dry microfiber cloth.',
      'active',
      FALSE,
      7
    ),
    (
      'everyday-bags',
      'ARIA Bucket Bag',
      'aria-bucket-bag',
      'A soft bucket silhouette that works from errands to coffee runs.',
      'The ARIA Bucket Bag gives the collection a relaxed everyday option with a drawstring-style closure and a shape that feels effortless.',
      255.00,
      NULL,
      '/seed/handbags/aria-bucket-bag.webp',
      ARRAY['/seed/handbags/aria-bucket-bag.webp']::text[],
      $$[
        {"name":"Brown","hex":"#6B4F3A","stock":6},
        {"name":"Beige","hex":"#D8C7AE","stock":2},
        {"name":"Olive","hex":"#6B7A45","stock":0}
      ]$$::jsonb,
      'Pebbled faux leather',
      '27 x 24 x 15 cm',
      'Store with the drawstring relaxed and avoid leaving it compressed.',
      'active',
      FALSE,
      8
    ),
    (
      'work-bags',
      'ARIA Structured Top Handle Bag',
      'aria-structured-top-handle-bag',
      'A compact top-handle bag for polished daily looks.',
      'The ARIA Structured Top Handle Bag is a crisp, refined piece that works for meetings, lunches, and events where a neater shape is preferred.',
      365.00,
      NULL,
      '/seed/handbags/aria-top-handle.webp',
      ARRAY['/seed/handbags/aria-top-handle.webp']::text[],
      $$[
        {"name":"Black","hex":"#111111","stock":5},
        {"name":"Caramel","hex":"#B57A4A","stock":4},
        {"name":"Ivory","hex":"#F4EBDD","stock":1}
      ]$$::jsonb,
      'Structured faux leather',
      '29 x 21 x 11 cm',
      'Keep the top handle upright and use the dust bag when not in use.',
      'active',
      TRUE,
      9
    ),
    (
      'new-arrivals',
      'ARIA Weekend Shopper Bag',
      'aria-weekend-shopper-bag',
      'A generous shopper for travel, weekend plans, and larger carry needs.',
      'The ARIA Weekend Shopper Bag is a relaxed large-format carryall with an easy shape that feels right for market runs, travel days, and casual work setups.',
      310.00,
      NULL,
      '/seed/handbags/aria-weekend-shopper.webp',
      ARRAY['/seed/handbags/aria-weekend-shopper.webp']::text[],
      $$[
        {"name":"Beige","hex":"#D8C7AE","stock":8},
        {"name":"Cream","hex":"#F5ECDC","stock":3},
        {"name":"Brown","hex":"#6B4F3A","stock":2},
        {"name":"Caramel","hex":"#B57A4A","stock":1}
      ]$$::jsonb,
      'Woven faux leather',
      '40 x 31 x 15 cm',
      'Best stored lightly stuffed to preserve the shopper shape.',
      'active',
      TRUE,
      10
    ),
    (
      'crossbody-bags',
      'ARIA Compact Phone Bag',
      'aria-compact-phone-bag',
      'A tiny crossbody designed for the phone, cards, and little else.',
      'The ARIA Compact Phone Bag is the smallest piece in the seed set. It is intentionally limited stock so the checkout flow can be tested against near-sold-out inventory.',
      145.00,
      129.00,
      '/seed/handbags/aria-phone-bag.webp',
      ARRAY['/seed/handbags/aria-phone-bag.webp']::text[],
      $$[
        {"name":"Black","hex":"#111111","stock":2},
        {"name":"Nude","hex":"#C89A84","stock":0},
        {"name":"Cream","hex":"#F5ECDC","stock":1}
      ]$$::jsonb,
      'Soft faux leather',
      '18 x 11 x 4 cm',
      'Keep this bag empty of sharp objects to avoid marking the surface.',
      'draft',
      FALSE,
      11
    ),
    (
      'shoulder-bags',
      'ARIA Elegant Nude Shoulder Bag',
      'aria-elegant-nude-shoulder-bag',
      'A warm neutral shoulder bag that leans more elevated and formal.',
      'The ARIA Elegant Nude Shoulder Bag is a soft neutral option with a timeless profile, designed to round out the shoulder bag assortment without feeling too casual.',
      298.00,
      NULL,
      '/seed/handbags/aria-nude-shoulder.webp',
      ARRAY['/seed/handbags/aria-nude-shoulder.webp']::text[],
      $$[
        {"name":"Nude","hex":"#C89A84","stock":4},
        {"name":"Cream","hex":"#F5ECDC","stock":2},
        {"name":"Taupe","hex":"#9A8472","stock":1}
      ]$$::jsonb,
      'Pebbled faux leather',
      '32 x 23 x 10 cm',
      'Protect the finish from dark dyes and store away from direct sun.',
      'archived',
      FALSE,
      12
    )
)
INSERT INTO public.products (
  category_id,
  name,
  slug,
  short_description,
  description,
  price,
  sale_price,
  image_url,
  images,
  colors,
  material,
  dimensions,
  care_instructions,
  status,
  is_featured,
  display_order
)
SELECT
  c.id,
  r.name,
  r.slug,
  r.short_description,
  r.description,
  r.price,
  r.sale_price,
  r.image_url,
  r.images,
  r.colors,
  r.material,
  r.dimensions,
  r.care_instructions,
  r.status,
  r.is_featured,
  r.display_order
FROM product_seed r
JOIN public.categories c ON c.slug = r.category_slug
ON CONFLICT (slug) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  colors = EXCLUDED.colors,
  material = EXCLUDED.material,
  dimensions = EXCLUDED.dimensions,
  care_instructions = EXCLUDED.care_instructions,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
