# ARIA Demo Seed Data

This seed package creates a small, realistic handbag catalog for local development and admin QA.

## What it seeds

- 7 categories:
  - `new-arrivals`
  - `everyday-bags`
  - `work-bags`
  - `evening-bags`
  - `crossbody-bags`
  - `tote-bags`
  - `shoulder-bags`
- 12 products:
  - 10 active
  - 1 draft
  - 1 archived
- 2 featured products and a few more "hero-worthy" pieces for homepage testing
- Color variants with stock counts
- One out-of-stock color
- One very low-stock product for checkout edge-case testing

## Demo products

- ARIA Classic Tote Bag
- ARIA Soft Shoulder Bag
- ARIA Mini Crossbody Bag
- ARIA Evening Clutch
- ARIA Everyday Hobo Bag
- ARIA Work Satchel
- ARIA Quilted Chain Bag
- ARIA Bucket Bag
- ARIA Structured Top Handle Bag
- ARIA Weekend Shopper Bag
- ARIA Compact Phone Bag
- ARIA Elegant Nude Shoulder Bag

## Image strategy

All products point at local public assets:

- `public/seed/handbags/aria-classic-tote.webp`
- `public/seed/handbags/aria-soft-shoulder.webp`
- `public/seed/handbags/aria-mini-crossbody.webp`
- `public/seed/handbags/aria-evening-clutch.webp`
- `public/seed/handbags/aria-everyday-hobo.webp`
- `public/seed/handbags/aria-work-satchel.webp`
- `public/seed/handbags/aria-quilted-chain.webp`
- `public/seed/handbags/aria-bucket-bag.webp`
- `public/seed/handbags/aria-top-handle.webp`
- `public/seed/handbags/aria-weekend-shopper.webp`
- `public/seed/handbags/aria-phone-bag.webp`
- `public/seed/handbags/aria-nude-shoulder.webp`

That means the storefront and admin pages can render the seed without needing Supabase Storage uploads.

## SQL file

Use `supabase/seed-demo-handbags.sql` for the actual seed. It:

- upserts categories by `slug`
- upserts products by `slug`
- does not truncate or delete any data
- keeps existing `views` and `downloads` untouched
- uses the same `products.colors` and `products.images` shape the app already expects

## Local validation

Run the local package check:

```bash
npm run seed:demo
```

This validation command checks that:

- the seed SQL file exists
- all 12 WebP images exist
- the SQL references every image path

## Applying the seed

The repo does not include a local SQL executor, so apply the SQL through whichever Supabase workflow you already use:

- Supabase SQL Editor
- Supabase CLI / `db execute`
- your own migration runner

Do not run it against production unless you intend to create these demo rows there.

## Notes

- The draft product is the compact phone bag.
- The archived product is the elegant nude shoulder bag.
- The mini crossbody is intentionally low-stock.
- The classic tote includes one color with zero stock for out-of-stock UI checks.
