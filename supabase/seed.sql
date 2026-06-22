-- Digital Products Store - Seed Data Only
-- Run this AFTER schema.sql to populate demo data

-- ============================================
-- SEED DATA - CATEGORIES
-- ============================================

INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Templates', 'templates', 'Ready-to-use templates for various purposes', 1),
  ('Business', 'business', 'Business plans, kits, and professional resources', 2),
  ('Marketing', 'marketing', 'Social media, advertising, and promotional materials', 3),
  ('Design', 'design', 'Brand assets, UI kits, and creative resources', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA - PRODUCTS
-- ============================================

DO $$
DECLARE
  templates_cat UUID;
  business_cat UUID;
  marketing_cat UUID;
  design_cat UUID;
BEGIN
  SELECT id INTO templates_cat FROM public.categories WHERE slug = 'templates';
  SELECT id INTO business_cat FROM public.categories WHERE slug = 'business';
  SELECT id INTO marketing_cat FROM public.categories WHERE slug = 'marketing';
  SELECT id INTO design_cat FROM public.categories WHERE slug = 'design';

  -- Templates Category Products
  INSERT INTO public.products (category_id, name, slug, short_description, description, price, file_type, file_size, status, is_featured, is_instant_download, views, downloads) VALUES
  (
    templates_cat,
    'Social Media Marketing Template Pack',
    'social-media-marketing-template-pack',
    'Complete set of 50+ professionally designed social media templates for Instagram, Facebook, and Twitter.',
    'Boost your social media presence with this comprehensive pack of 50+ professionally designed templates. Perfect for businesses, influencers, and marketers who want to maintain a consistent brand aesthetic without spending hours on design. Includes editable PSD and AI files.',
    29.99,
    'ZIP',
    15728640,
    'active',
    TRUE,
    TRUE,
    1250,
    342
  ),
  (
    templates_cat,
    'Website UI Template Pack',
    'website-ui-template-pack',
    'Modern website UI kit with 100+ components for Figma and Sketch.',
    'A comprehensive website UI kit featuring 100+ meticulously crafted components. Built for Figma with auto-layout support. Includes navigation bars, hero sections, pricing tables, feature grids, testimonials, CTAs, and much more. Perfect for rapid prototyping and production-ready designs.',
    49.99,
    'ZIP',
    52428800,
    'active',
    TRUE,
    TRUE,
    890,
    156
  );

  -- Business Category Products
  INSERT INTO public.products (category_id, name, slug, short_description, description, price, file_type, file_size, status, is_featured, is_instant_download, views, downloads) VALUES
  (
    business_cat,
    'Complete Business Plan Kit',
    'complete-business-plan-kit',
    'Comprehensive business plan template with financial projections and investor-ready presentations.',
    'Everything you need to create a professional business plan. Includes 50+ page Word template, Excel financial projections, PowerPoint investor deck, and step-by-step guide. Used by startups and small businesses to secure funding.',
    79.99,
    'ZIP',
    10485760,
    'active',
    TRUE,
    TRUE,
    2100,
    478
  ),
  (
    business_cat,
    'Notion Productivity Dashboard',
    'notion-productivity-dashboard',
    'Pre-built Notion workspace for task management, habit tracking, and goal setting.',
    'Transform your productivity with this all-in-one Notion dashboard. Features include daily task management, habit tracker, goal tracker, project manager, weekly review template, and reading list. Fully customizable and beginner-friendly.',
    19.99,
    'ZIP',
    2097152,
    'active',
    FALSE,
    TRUE,
    650,
    203
  );

  -- Marketing Category Products
  INSERT INTO public.products (category_id, name, slug, short_description, description, price, file_type, file_size, status, is_featured, is_instant_download, views, downloads) VALUES
  (
    marketing_cat,
    'E-book Marketing Guide',
    'ebook-marketing-guide',
    'The ultimate guide to marketing your digital products, from SEO to email campaigns.',
    'Learn proven marketing strategies that have generated millions in sales for digital product creators. This 200+ page guide covers SEO, content marketing, email list building, launch strategies, affiliate programs, and paid advertising. Includes worksheets and checklists.',
    39.99,
    'PDF',
    5242880,
    'active',
    FALSE,
    TRUE,
    420,
    89
  );

  -- Design Category Products
  INSERT INTO public.products (category_id, name, slug, short_description, description, price, file_type, file_size, status, is_featured, is_instant_download, views, downloads) VALUES
  (
    design_cat,
    'Brand Identity Starter Kit',
    'brand-identity-starter-kit',
    'Complete brand identity package with logo templates, color palettes, and typography guides.',
    'Build a memorable brand with this comprehensive identity kit. Includes 20 logo templates (AI, EPS, PNG), brand color palette generator, typography pairing guide, business card template, letterhead template, and brand guidelines document template.',
    59.99,
    'ZIP',
    33554432,
    'active',
    FALSE,
    TRUE,
    780,
    167
  );

END $$;

-- ============================================
-- ADDITIONAL PRODUCTS (for variety)
-- ============================================

DO $$
DECLARE
  business_cat UUID;
  marketing_cat UUID;
  design_cat UUID;
BEGIN
  SELECT id INTO business_cat FROM public.categories WHERE slug = 'business';
  SELECT id INTO marketing_cat FROM public.categories WHERE slug = 'marketing';
  SELECT id INTO design_cat FROM public.categories WHERE slug = 'design';

  INSERT INTO public.products (category_id, name, slug, short_description, description, price, file_type, file_size, status, is_instant_download, views, downloads) VALUES
  (
    business_cat,
    'Startup Pitch Deck Template',
    'startup-pitch-deck-template',
    'Investor-ready pitch deck template with 30+ slides.',
    'Present your startup idea with confidence. This pitch deck template includes 30+ professionally designed slides, speaker notes, and a guide on how to pitch. Used by YC and Techstars startups.',
    39.99,
    'KEY',
    5242880,
    'active',
    TRUE,
    320,
    45
  ),
  (
    marketing_cat,
    'Email Marketing Campaign Kit',
    'email-marketing-campaign-kit',
    'Complete email sequences and templates for product launches.',
    'Maximize your email conversions with this complete campaign kit. Includes 10 email sequences, subject line formulas, landing page templates, and automation workflows. Perfect for product launches and affiliate promotions.',
    34.99,
    'ZIP',
    8388608,
    'active',
    TRUE,
    280,
    67
  ),
  (
    design_cat,
    'Instagram Highlight Covers Pack',
    'instagram-highlight-covers-pack',
    '150+ gradient and minimalist Instagram highlight cover designs.',
    'Elevate your Instagram profile with these beautiful highlight covers. Includes 150+ designs in gradient and minimalist styles, organized by category. Easy to customize in Canva or Photoshop.',
    14.99,
    'ZIP',
    15728640,
    'active',
    TRUE,
    510,
    134
  );

END $$;
