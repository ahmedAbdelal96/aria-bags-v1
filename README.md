# ARIA — Luxury Women's Handbags Store

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**A luxury ecommerce storefront for women's handbags, with admin dashboard and Supabase backend.**

[Features](#features) • [Design](#design) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Supabase Setup](#supabase-setup) • [Project Structure](#project-structure)

</div>

---

The full design system (color palette, typography, motion guidelines, components) lives in [`design.md`](./design.md).

[Features](#features) • [Admin Dashboard](#admin-dashboard) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Supabase Setup](#supabase-setup) • [Project Structure](#project-structure)

</div>

---

## Visual Preview

### Homepage
![Homepage](docs/assets/screenshots/home.png)

### Product Catalog
![Products](docs/assets/screenshots/products.png)

### Product Details
![Product Details](docs/assets/screenshots/product-details.png)

### Admin Dashboard
![Admin](docs/assets/screenshots/admin.png)

### Cart & Checkout
![Checkout](docs/assets/screenshots/checkout.png)

---

## Design

ARIA uses a dark luxury palette with metallic gold accents. See [`design.md`](./design.md) for the full design system.

| Token | Hex | Usage |
|-------|-----|-------|
| **Luxury Black** | `#060904` | Main background |
| **Deep Charcoal** | `#12130E` | Cards & panels |
| **Leather Black** | `#1A1B15` | Card surfaces |
| **Metallic Gold** | `#C7B06B` | Primary CTAs, brand |
| **Soft Gold** | `#E9D984` | Accent / hover |
| **Antique Gold** | `#8E733E` | Subtle gold text |
| **Warm Ivory** | `#F8F1DF` | Body text |

---

## Features

### Storefront
- Luxury hero with editorial layout
- Dynamic product listing from Supabase
- Product detail pages with gallery, colour swatches, and stock awareness
- Collection browsing by category
- Featured + New Arrivals sections
- Shopping bag with persistent state (Zustand)
- Physical-order checkout with delivery address and COD payment
- Order confirmation and "My orders" pages
- Skeleton loading, empty states, and graceful error states
- Fully responsive (mobile, tablet, desktop)

### Admin Dashboard
- **Dashboard Overview**: Stats for products, categories, orders, customers, revenue
- **Products Management**: Full CRUD with images, colours/stock variants, material, dimensions, care instructions, sale price, featured toggle, status
- **Collections Management**: Create, edit, delete with product counts
- **Orders View**: Editable status, customer + shipping info
- **Customers View**: User list with admin badges
- **Store Settings**: Configure hero, promo, CTA copy

### Supabase Backend
- PostgreSQL database with full schema (handbag model)
- User authentication (signup, login, session management)
- Seed data with 6 ARIA handbags across 5 collections
- Row Level Security (RLS) policies documented and ready to apply
- Supabase Storage for product images (public bucket)

---

## Admin Dashboard Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard overview with stats and quick actions |
| `/admin/products` | Products list with search, filter, status actions |
| `/admin/products/new` | Create new product |
| `/admin/products/[id]` | Edit existing product |
| `/admin/categories` | Category management with product counts |
| `/admin/orders` | View all orders (demo checkout) |
| `/admin/customers` | View registered users |
| `/admin/settings` | Configure store content |

---

## Customer Routes

| Route | Description |
|-------|-------------|
| `/account/downloads` | My Downloads - access purchased digital products |
| `/order-confirmation/[id]` | Order confirmation with download links |

### Secure Download System

When a user purchases a product with a `download_file_path`:

1. The file is stored in the private `product-files` bucket
2. On purchase, a record is created in the `orders` and `order_items` tables
3. The user can download from `/account/downloads` or the order confirmation page
4. The API route `/api/download/[productId]` verifies ownership and generates a signed URL
5. Signed URLs expire after 60 seconds for security

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Reusable UI components |
| **Supabase** | PostgreSQL database, Auth, Storage-ready |
| **Zustand** | Lightweight state management for cart |
| **React Hook Form + Zod** | Form handling and validation |
| **Vercel** | Deployment platform |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project (free tier works)

### Installation

```bash
# Using npm
npm install
npm run dev

# Using pnpm
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API.

---

## Supabase Setup

### 1. Run Database Schema

1. Go to your Supabase project → SQL Editor
2. Copy and paste the contents of `supabase/schema.sql`
3. Click "Run" to create all tables and functions

### 2. Run Store Settings Migration (Optional but Recommended)

For store settings to work, run:

1. Go to SQL Editor
2. Copy and paste `supabase/migrations/001_add_store_settings.sql`
3. Click "Run"

### 3. Seed Demo Data (Optional)

The schema.sql already includes seed data. To run separately:

1. Go to SQL Editor
2. Copy and paste `supabase/seed.sql`
3. Click "Run"

This creates:
- 4 Categories: Templates, Business, Marketing, Design
- 8 Digital Products with realistic data

### 4. Create Admin User

1. Go to `/auth/sign-up` and create an account
2. In Supabase SQL Editor, run:

```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

3. Refresh your app — you now see the "Admin" link in the sidebar

### 5. Create Product Images Bucket (Required for Image Upload)

For product image upload to work, create a public bucket:

**Option A: Via Supabase Dashboard**
1. Go to your project → Storage
2. Click "New bucket"
3. Name: `product-images`
4. Select "Public bucket"
5. Set file size limit: 5MB
6. Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

**Option B: Via SQL**
1. Go to SQL Editor
2. Copy and paste `supabase/migrations/002_create_product_images_bucket.sql`
3. Click "Run"

### 6. Create Product Files Bucket (For Paid Downloads)

For secure paid download files, create a private bucket:

**Option A: Via Supabase Dashboard**
1. Go to your project → Storage
2. Click "New bucket"
3. Name: `product-files`
4. Select "Private bucket" (NOT public)
5. Set file size limit: 100MB
6. Allowed MIME types: `application/pdf`, `application/zip`, `application/x-rar-compressed`, `video/mp4`, `image/png`, `image/jpeg`, `application/vnd.adobe.photoshop`, `application/postscript`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Option B: Via SQL**
1. Go to SQL Editor
2. Copy and paste `supabase/migrations/004_create_product_files_bucket.sql`
3. Click "Run"

### 7. Run Download File Column Migration

Add columns for private download file paths:

1. Go to SQL Editor
2. Copy and paste `supabase/migrations/003_add_download_file_path.sql`
3. Click "Run"

### 8. Set Up RLS (Recommended for Production)

Run `supabase/rls.sql` in your Supabase SQL Editor to enable Row Level Security policies.

---

## Project Structure

```
├── app/                        # Next.js App Router
│   ├── admin/                  # Admin dashboard pages
│   │   ├── products/           # Product management (list, create, edit)
│   │   ├── categories/         # Category management
│   │   ├── orders/             # Orders view
│   │   ├── customers/          # Customers view
│   │   └── settings/           # Store settings
│   ├── auth/                   # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── callback/           # OAuth callback handler
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Demo checkout
│   ├── products/[slug]/        # Product detail pages
│   ├── category/[slug]/         # Category listing pages
│   └── order-confirmation/[id]/ # Order confirmation
├── components/                 # React components
│   ├── admin/                  # Admin-specific components
│   ├── ui/                     # shadcn/ui components
│   ├── navbar.tsx              # Navigation
│   ├── footer.tsx              # Footer
│   ├── cart-provider.tsx       # Cart context
│   └── product-card.tsx         # Product card
├── lib/                        # Library code
│   ├── db/                     # Public database queries
│   ├── admin/                  # Admin database queries
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── orders.ts
│   │   ├── customers.ts
│   │   └── settings.ts
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── proxy.ts            # Middleware proxy
│   ├── store/                  # State management
│   │   └── cart.ts             # Zustand cart store
│   └── types.ts                # TypeScript types
├── hooks/                      # Custom React hooks
├── docs/                       # Documentation
│   └── assets/                 # Screenshots, diagrams
├── supabase/                   # SQL files
│   ├── schema.sql              # Database schema + seed
│   ├── seed.sql                # Seed data only
│   ├── rls.sql                # Row Level Security policies
│   └── migrations/             # Database migrations
│       ├── 001_add_store_settings.sql
│       └── 002_create_product_images_bucket.sql
└── public/                     # Static assets
```

---

## Demo Scope

### ✅ Implemented Now

- Dynamic products and categories from Supabase
- Admin dashboard with full management features
- Shopping cart with persistent state
- Demo checkout flow (simulated, no real payment)
- User authentication (signup, login, logout)
- Role-based admin access via `is_admin` flag
- Responsive storefront design
- Product slug-based routing
- Product status control (publish/draft/archive)
- Featured product toggle
- Store settings management
- Product image upload to Supabase Storage (public bucket)

### 🔄 Future Production Phase

- Stripe or Paddle payment integration
- Email order confirmations
- Product search and filtering
- Discount/promo code system
- Order tracking
- Email notifications

---

## Client Presentation Note

This MVP demonstrates how a static storefront can evolve into a real digital products platform. The admin dashboard allows non-technical users to manage products and categories directly from the database, while the Supabase backend provides a scalable foundation ready for payment processing, secure file delivery, and additional features.

---

## License

MIT License — Free to use for personal and commercial projects.

---

<div align="center">

**Built with [Next.js](https://nextjs.org) + [Supabase](https://supabase.com)**

</div>
