-- ARIA demo image cleanup
-- Safe, non-destructive cleanup for legacy Unsplash demo rows.
-- Only update rows where the product image payload still references images.unsplash.com.

do $$
declare
  images_type text;
begin
  select c.data_type
  into images_type
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'products'
    and c.column_name = 'images';

  if images_type = 'ARRAY' then
    update public.products
    set
      image_url = case
        when slug = 'onyx-classic-tote' then '/seed/handbags/aria-classic-tote.webp'
        when slug = 'luna-mini-crossbody' then '/seed/handbags/aria-mini-crossbody.webp'
        when slug = 'aurora-shoulder-bag' then '/seed/handbags/aria-soft-shoulder.webp'
        when slug = 'etoile-evening-clutch' then '/seed/handbags/aria-evening-clutch.webp'
        when slug = 'mira-city-backpack' then '/seed/handbags/aria-work-satchel.webp'
        when slug = 'sienna-structured-tote' then '/seed/handbags/aria-classic-tote.webp'
        else image_url
      end,
      images = case
        when slug = 'onyx-classic-tote' then array['/seed/handbags/aria-classic-tote.webp']::text[]
        when slug = 'luna-mini-crossbody' then array['/seed/handbags/aria-mini-crossbody.webp']::text[]
        when slug = 'aurora-shoulder-bag' then array['/seed/handbags/aria-soft-shoulder.webp']::text[]
        when slug = 'etoile-evening-clutch' then array['/seed/handbags/aria-evening-clutch.webp']::text[]
        when slug = 'mira-city-backpack' then array['/seed/handbags/aria-work-satchel.webp']::text[]
        when slug = 'sienna-structured-tote' then array['/seed/handbags/aria-classic-tote.webp']::text[]
        else images
      end
    where
      image_url ilike '%images.unsplash.com%'
      or exists (
        select 1
        from unnest(coalesce(images, array[]::text[])) as src
        where src ilike '%images.unsplash.com%'
      );

  elsif images_type = 'jsonb' then
    update public.products
    set
      image_url = case
        when slug = 'onyx-classic-tote' then '/seed/handbags/aria-classic-tote.webp'
        when slug = 'luna-mini-crossbody' then '/seed/handbags/aria-mini-crossbody.webp'
        when slug = 'aurora-shoulder-bag' then '/seed/handbags/aria-soft-shoulder.webp'
        when slug = 'etoile-evening-clutch' then '/seed/handbags/aria-evening-clutch.webp'
        when slug = 'mira-city-backpack' then '/seed/handbags/aria-work-satchel.webp'
        when slug = 'sienna-structured-tote' then '/seed/handbags/aria-classic-tote.webp'
        else image_url
      end,
      images = case
        when slug = 'onyx-classic-tote' then '["/seed/handbags/aria-classic-tote.webp"]'::jsonb
        when slug = 'luna-mini-crossbody' then '["/seed/handbags/aria-mini-crossbody.webp"]'::jsonb
        when slug = 'aurora-shoulder-bag' then '["/seed/handbags/aria-soft-shoulder.webp"]'::jsonb
        when slug = 'etoile-evening-clutch' then '["/seed/handbags/aria-evening-clutch.webp"]'::jsonb
        when slug = 'mira-city-backpack' then '["/seed/handbags/aria-work-satchel.webp"]'::jsonb
        when slug = 'sienna-structured-tote' then '["/seed/handbags/aria-classic-tote.webp"]'::jsonb
        else images
      end
    where
      image_url ilike '%images.unsplash.com%'
      or images::text ilike '%images.unsplash.com%';

  elsif images_type = 'text' then
    update public.products
    set
      image_url = case
        when slug = 'onyx-classic-tote' then '/seed/handbags/aria-classic-tote.webp'
        when slug = 'luna-mini-crossbody' then '/seed/handbags/aria-mini-crossbody.webp'
        when slug = 'aurora-shoulder-bag' then '/seed/handbags/aria-soft-shoulder.webp'
        when slug = 'etoile-evening-clutch' then '/seed/handbags/aria-evening-clutch.webp'
        when slug = 'mira-city-backpack' then '/seed/handbags/aria-work-satchel.webp'
        when slug = 'sienna-structured-tote' then '/seed/handbags/aria-classic-tote.webp'
        else image_url
      end,
      images = case
        when images ilike '%images.unsplash.com%' then '/seed/handbags/aria-classic-tote.webp'
        else images
      end
    where
      image_url ilike '%images.unsplash.com%'
      or images ilike '%images.unsplash.com%';

  else
    raise notice 'Skipped cleanup because products.images type is %', images_type;
  end if;
end $$;
