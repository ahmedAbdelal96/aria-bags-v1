# Row Level Security for ARIA

Use `supabase/aria-one-shot.sql` for a fresh Supabase project. It is the source
of truth for the current handbag setup.

## What It Covers

- Public read access for categories
- Public read access for active products only
- Guest checkout through SECURITY DEFINER RPC only
- Admin access for products, categories, orders, order items, profiles, and store settings

## Recommended Setup

1. Open Supabase SQL Editor
2. Run `supabase/aria-one-shot.sql`
3. Verify that RLS is enabled on all relevant tables
4. Test the storefront, checkout flow, and admin pages with a non-admin account

## Production Checklist

- Public users can see categories
- Public users can see active products only
- Draft and archived products are hidden from public reads
- Guest checkout works only through the RPC functions
- Direct anonymous writes to orders and order_items remain blocked
- Admin users can manage products and collections
- Admin users can read and update orders
- Admin users can read order items for order management
- Admin users can read profile records linked to orders and admin access
- Admin users can read and update store settings if used by the app

## Notes

- Do not rely on client-side admin checks alone.
- Use `auth.uid()` and `profiles.is_admin = true` in policies.
- Keep the script idempotent by dropping old policies before creating new ones.
- `supabase/rls-handbags.sql` and the older migration files are historical only.
- Keep `supabase/rls.sql` deprecated; do not use it for new setup.
- Do not apply destructive SQL automatically from the app.
