# QA Checklist

Use this checklist to verify the handbag store before a demo or launch.

## Storefront

### Homepage
- [ ] Homepage loads without errors
- [ ] Hero section displays correctly
- [ ] Featured collections render
- [ ] New arrivals render from Supabase
- [ ] Featured products render from Supabase
- [ ] Footer displays correctly
- [ ] Navbar shows logo, navigation links, and cart icon

### Product Page
- [ ] `/products/[slug]` loads product data
- [ ] Product gallery displays images or a placeholder
- [ ] Product name, description, and price display correctly
- [ ] Color swatches show available variants
- [ ] Quantity selector works
- [ ] Add to bag button works
- [ ] Material, dimensions, and care details display correctly

### Category Page
- [ ] `/category/[slug]` loads collection products
- [ ] Category header displays name and description
- [ ] Products filter by category correctly
- [ ] Empty category shows an appropriate message

### Cart and Checkout
- [ ] Cart count updates immediately
- [ ] Cart persists after refresh
- [ ] Cart page shows items, quantities, and totals
- [ ] Guest can checkout without login
- [ ] Checkout creates order and order items
- [ ] Order confirmation page loads after checkout
- [ ] Guest order confirmation shows customer details and item summary
- [ ] Guest checkout success redirects to `/order-confirmation/[id]?token=...`
- [ ] Guest checkout with invalid quantity fails
- [ ] Guest checkout with unavailable color fails
- [ ] Checkout fails cleanly when quantity exceeds available stock
- [ ] Checkout fails cleanly when two orders compete for the last item
- [ ] Successful checkout decrements the selected color stock
- [ ] Failed checkout does not create partial orders or items
- [ ] Stock-related checkout errors keep the cart intact for adjustment

## Authentication

- [ ] `/admin/login` works as admin login
- [ ] `/admin/login?next=/admin` returns to the requested page after success
- [ ] `/admin/sign-up` shows the admin-only notice and does not present customer registration
- [ ] Auth callback completes session setup
- [ ] Logout clears the session
- [ ] Confirmation link without token fails closed
- [ ] Confirmation link with the correct token works

## Admin

- [ ] Guest users are redirected from `/admin` to `/admin/login?next=/admin`
- [ ] Guest users are redirected from nested admin routes to `/admin/login?next=<original path>`
- [ ] Logged-in non-admin users cannot access `/admin` and are sent to `/`
- [ ] Logged-in admin users can access `/admin` and nested routes normally
- [ ] Guest cannot access admin pages
- [ ] Non-admin cannot access admin pages
- [ ] Admin can access admin pages
- [ ] Admin dashboard loads correctly
- [ ] Products can be created and edited
- [ ] Color variants and stock can be managed
- [ ] Category CRUD works
- [ ] Order status updates work
- [ ] Customer list loads correctly
- [ ] Store settings save successfully
- [ ] Admin link is hidden for non-admin users
- [ ] Admin link is visible for admin users
- [ ] Footer shows an Admin Login link
- [ ] Navbar does not show customer login or signup prompts

## Responsive Design

- [ ] Desktop layout is stable
- [ ] Tablet layout is usable
- [ ] Mobile layout is usable
- [ ] Touch targets are accessible

## Error States

- [ ] Missing product shows not found state
- [ ] Missing order shows not found state
- [ ] Validation errors display inline
- [ ] Network failures show a readable message
- [ ] Stock depletion shows a friendly availability message
