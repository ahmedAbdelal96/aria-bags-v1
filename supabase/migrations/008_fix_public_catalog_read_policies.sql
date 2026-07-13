-- ARIA public catalog read policy repair
-- Forward-only and idempotent.
-- Fixes anon storefront reads without touching write access or guest checkout RPCs.

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read active products" ON public.products;

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
