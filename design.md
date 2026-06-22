# ARIA Luxury Bags Store — Design System

## Brand Direction

ARIA is a luxury ecommerce brand for women's handbags. The visual style feels premium, elegant, feminine, modern, and trustworthy.

The design avoids generic ecommerce colors and uses a dark luxury palette with metallic gold accents.

## Core Visual Mood

- Luxury
- Black leather
- Metallic gold
- Elegant spacing
- High-end product photography
- Smooth subtle motion
- Clean typography
- Premium editorial layout

## Color Palette

### Primary

- Luxury Black: `#060904`
- Deep Charcoal: `#12130E`
- Leather Black: `#1A1B15`
- Metallic Gold: `#C7B06B`
- Soft Gold: `#E9D984`
- Antique Gold: `#8E733E`
- Warm Ivory: `#F8F1DF`
- Muted Gold Text: `#B7AA8B`

### Usage

- Main background: Luxury Black / Deep Charcoal
- Cards: Leather Black or very dark charcoal
- Primary CTA: Metallic Gold
- CTA text: Luxury Black
- Secondary CTA: transparent with gold border
- Body text: Warm Ivory / muted warm gray
- Borders: low-opacity gold or warm neutral
- Sale/alert colors should be muted and not too bright.

## Typography

- Headings: premium, spacious, confident (use `Cormorant Garamond` or `Playfair Display` for editorial feel, paired with `Inter` for body).
- Body: clean and easy to read (`Inter`).
- Buttons: medium weight, uppercase tracking or refined title case.
- Avoid childish or overly playful fonts.

## Layout Principles

- Mobile-first.
- Spacious sections.
- Strong product imagery.
- Clear hierarchy.
- Clean navigation.
- No visual clutter.
- Smooth scrolling feel.
- Premium empty states.
- Consistent spacing.

## Motion Guidelines

Use motion to improve polish, not to distract.

Recommended:

- Fade-in sections on scroll (CSS-only with `@keyframes` + `IntersectionObserver`-like behavior in pure CSS using `animation` on visible).
- Slight upward reveal for product cards.
- Subtle hover lift on cards.
- Smooth image zoom on hover.
- Gentle button transitions.
- Cart drawer open/close animation.
- Admin dashboard simple transitions.

Avoid:

- Excessive bouncing.
- Too many animations at once.
- Long delays.
- Heavy motion on mobile.
- Animations that block user actions.

## Skeleton Loading

Add skeleton states for:

- Product grid.
- Product details.
- Cart items if needed.
- Admin products table.
- Admin orders table.
- Dashboard stats.

Skeletons should match the final layout and use subtle dark/gold neutral tones.

## Customer Pages

### Home Page

Must include:

- Luxury hero section.
- Brand logo / brand name feel.
- Short premium headline.
- CTA to shop collection.
- Featured collections (categories).
- New arrivals.
- Best sellers or featured products.
- Why ARIA section.
- Lifestyle/editorial section.
- Footer with brand information.

### Products Page (Category)

Must include:

- Product grid.
- Category filter.
- Color filter.
- Price sorting/filtering.
- Availability state.
- Skeleton loading.
- Empty state.
- Smooth product card motion.

### Product Details Page

Must include:

- Product image gallery.
- Color selection.
- Quantity selection.
- Price (and sale price when present).
- Stock awareness.
- Material.
- Dimensions.
- Care instructions.
- Shipping/return information.
- Related products if practical.
- Add to cart button with clear feedback.

### Cart / Checkout

Support physical product flow:

- customer name
- phone
- email if available
- address
- city
- notes
- payment method (Cash on Delivery default)
- order summary
- confirmation state

## Admin Dashboard

Admin must support:

- Add product.
- Edit product.
- Delete/archive product.
- Product images (multiple).
- Product categories.
- Product colors/variants.
- Quantity per color.
- Price and sale price.
- Featured product toggle.
- Product status: active / draft / archived.
- Orders management.
- Customer/order details.

Admin UX rules:

- Keep it simple.
- Clear forms.
- Good validation.
- Loading states.
- Empty states.
- Confirmation before destructive actions.
- No complicated workflows.

## Product Data Model Direction

For handbags, product logic should support:

- product base data
- multiple images
- color variants
- stock quantity per color
- optional SKU per variant
- optional material
- optional dimensions
- optional care instructions

Digital-product concepts (downloads, file_url, instant_download) are kept in the database for legacy data but are NOT shown to customers in the ARIA experience.

## Components To Prefer

Reusable components:

- `ProductCard`
- `ProductGrid`
- `ProductSkeleton`
- `SectionHeader`
- `LuxuryButton`
- `EmptyState`
- `AdminTable`
- `AdminFormField`
- `ColorSwatch`
- `QuantitySelector`
- `ProductGallery`

## Quality Bar

The final result should feel like a real premium handbag store ready to present to a client.