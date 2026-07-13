-- ARIA guest checkout schema alignment
-- Forward-only migration for live databases missing simplified guest checkout columns.
-- This migration only adds columns and defaults; it does not drop or rewrite existing data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone_2 TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT;

UPDATE public.orders
SET confirmation_token = gen_random_uuid()::text
WHERE confirmation_token IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN confirmation_token SET DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_confirmation_token_unique_idx
ON public.orders (confirmation_token)
WHERE confirmation_token IS NOT NULL;
