-- ARIA checkout reliability fix
-- Forward-only migration for live databases missing orders.confirmation_token.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT;

UPDATE public.orders
SET confirmation_token = gen_random_uuid()::text
WHERE confirmation_token IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN confirmation_token SET DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_confirmation_token_unique_idx
ON public.orders (confirmation_token)
WHERE confirmation_token IS NOT NULL;
