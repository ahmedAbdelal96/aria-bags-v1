# ARIA - Luxury Women's Handbags Store

ARIA is a luxury ecommerce MVP for women's handbags built with Next.js and Supabase.

The project currently includes:
- A luxury storefront with homepage, product pages, category pages, cart, guest checkout, and order confirmation
- Auth pages for admin/store management login, sign-up notice, and auth callback handling
- An admin dashboard for products, collections, orders, customers, and store settings
- Supabase schema, seed data, and RLS policies tailored for a physical handbag store

## Current Scope

### Storefront
- Homepage with hero, collections, new arrivals, featured products, and brand sections
- Product detail pages with gallery, color swatches, stock, material, dimensions, and care details
- Category pages for browsing collections
- Persistent shopping bag with variant-aware quantity handling
- Guest checkout flow for physical products with cash on delivery
- Order confirmation page at `/order-confirmation/[id]`

### Admin
- Product management with images, colors, stock, pricing, featured toggle, status, material, dimensions, and care instructions
- Collection management
- Orders view with status updates
- Guest order contact list
- Store settings editor for homepage copy and CTAs

### Supabase
- PostgreSQL schema for products, categories, orders, order items, profiles, and store settings
- Seed data for 5 handbag collections and 6 handbag products
- Product images stored in the public `product-images` bucket
- Handbag-focused RLS script in `supabase/rls-handbags.sql` is the source of truth

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Zustand
- React Hook Form and Zod

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Run `supabase/schema.sql`
2. Run `supabase/seed.sql`
3. Run `supabase/migrations/001_add_store_settings.sql`
4. Create the public `product-images` bucket, or run `supabase/migrations/002_create_product_images_bucket.sql`
5. Run `supabase/migrations/005_add_handbag_fields.sql`
6. Run `supabase/migrations/006_guest_checkout.sql`
7. Apply `supabase/rls-handbags.sql`

## Important Notes

- The checkout flow is COD only and does not require customer login.
- Legacy download-related fields remain only for database compatibility and are not part of the ARIA customer flow.
- Customer accounts are not part of the current storefront flow.
- Auth is reserved for admin/store management access.
- `next.config.mjs` should not hide TypeScript build errors.
- Guest checkout uses a secure server-side RPC flow. Do not expose service role keys to the browser.
- Database-level RLS is still required before production.

## Verification

Recommended checks:

```bash
npm run verify:env
npx tsc --noEmit
npm run lint
npm run build
```

## Project Structure

```
app/        Next.js App Router pages
components/ Shared UI and feature components
lib/        Supabase, DB, and utility helpers
supabase/   SQL schema, seed data, migrations, and RLS
docs/       QA and security notes
public/     Static assets
```
