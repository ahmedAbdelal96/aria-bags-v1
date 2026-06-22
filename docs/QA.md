# QA Checklist

Use this checklist to verify the digital products store is working correctly before a demo or launch.

## Storefront

### Homepage
- [ ] Homepage loads without errors
- [ ] Hero section displays correctly with red background
- [ ] Benefits section displays with gray background and 3 cards
- [ ] Featured products section shows products from Supabase
- [ ] Blue CTA section displays at bottom
- [ ] Dark footer renders correctly
- [ ] Navbar shows logo, navigation links, cart icon

### Products Page
- [ ] `/products` route exists (if implemented)
- [ ] Products display in grid layout
- [ ] Product cards show image, name, price, description
- [ ] "Instant" badge appears on product cards
- [ ] Add to Cart button works

### Product Detail Page
- [ ] `/products/[slug]` loads product by slug
- [ ] Product image displays (or placeholder if missing)
- [ ] Product name, description, price display correctly
- [ ] File information section shows file type and size
- [ ] "Add to Cart" button adds product to cart
- [ ] Breadcrumb navigation works
- [ ] Category link works
- [ ] Missing product shows 404 or "not found" message

### Category Page
- [ ] `/category/[slug]` loads category products
- [ ] Category header displays with name and description
- [ ] Products filter by category correctly
- [ ] Empty category shows appropriate message

### Product Image Fallback
- [ ] Products without images show placeholder UI
- [ ] Placeholder has icon and "Digital Product" text
- [ ] Gradient background displays correctly

### Mobile Layout
- [ ] Navbar collapses to mobile menu on small screens
- [ ] Hero text is readable on mobile
- [ ] Product cards stack in single column on mobile
- [ ] Cart and checkout are usable on mobile
- [ ] Footer columns stack on mobile

## Cart

### Add to Cart
- [ ] "Add to Cart" button on product cards works
- [ ] "Add to Cart" button on product detail page works
- [ ] Cart count in navbar updates immediately
- [ ] Toast notification appears (if implemented)
- [ ] Cannot add same product twice (quantity increases)

### Cart Page
- [ ] `/cart` route loads
- [ ] All cart items display with correct quantities
- [ ] Product images show correctly
- [ ] Product names link to detail pages
- [ ] Quantity +/- controls work
- [ ] Remove button works
- [ ] Subtotal calculates correctly
- [ ] Total is correct
- [ ] "Proceed to Checkout" button exists
- [ ] "Clear Cart" button works
- [ ] Empty cart shows appropriate message

### Cart Persistence
- [ ] Cart persists after page refresh
- [ ] Cart persists after closing browser
- [ ] Cart is user-specific (if logged in)

## Checkout

### Checkout Page
- [ ] `/checkout` route loads
- [ ] Redirects to login if not authenticated
- [ ] Cart items display in order summary
- [ ] Total is correct
- [ ] Demo warning is visible
- [ ] Form fields are disabled (demo mode)
- [ ] Card number shows test card 4242

### Checkout Flow
- [ ] Clicking "Complete Order" creates order in Supabase
- [ ] Order items are created correctly
- [ ] Cart clears after successful order
- [ ] Redirects to order confirmation page
- [ ] Success message displays

### Order Confirmation
- [ ] `/order-confirmation/[id]` loads
- [ ] Order details display correctly
- [ ] Order items list is correct
- [ ] Demo notice displays
- [ ] "Continue Shopping" button works

## Authentication

### Register
- [ ] `/auth/sign-up` route loads
- [ ] Can create account with email/password
- [ ] Password confirmation works
- [ ] Error messages display for invalid input
- [ ] Redirects to success page after signup
- [ ] Email confirmation is sent

### Login
- [ ] `/auth/login` route loads
- [ ] Can login with existing account
- [ ] Error messages display for invalid credentials
- [ ] Redirects to homepage after login
- [ ] "Remember me" works if implemented

### Logout
- [ ] Logout button works
- [ ] User state clears correctly
- [ ] Admin link disappears
- [ ] Cannot access protected pages after logout

### Protected Pages
- [ ] `/checkout` redirects to login if not authenticated
- [ ] `/order-confirmation/[id]` requires login
- [ ] Admin pages require admin role

## Admin Dashboard

### Access Control
- [ ] Non-admin users cannot access `/admin`
- [ ] Non-admin users cannot access `/admin/products`
- [ ] Non-admin users cannot access `/admin/categories`
- [ ] Admin users can access all admin pages
- [ ] Redirect to homepage if not authorized

### Admin Dashboard (`/admin`)
- [ ] Stats cards display correctly
- [ ] Quick action buttons work
- [ ] Recent products list shows

### Product Management
- [ ] `/admin/products` lists all products
- [ ] Search/filter works
- [ ] Status badges display correctly
- [ ] Edit button navigates to edit page
- [ ] Delete button works with confirmation
- [ ] "Add Product" button works

### Create Product
- [ ] `/admin/products/new` loads
- [ ] Form fields work correctly
- [ ] Category dropdown populates
- [ ] Price input accepts decimals
- [ ] Status dropdown works
- [ ] Submit creates product in Supabase
- [ ] Success redirects to products list
- [ ] Product appears in storefront

### Edit Product
- [ ] `/admin/products/[id]` loads with existing data
- [ ] Form pre-populates correctly
- [ ] Submit updates product in Supabase
- [ ] Changes reflect in storefront

### Category Management
- [ ] `/admin/categories` loads
- [ ] Category list displays
- [ ] Add category form works
- [ ] Edit category works
- [ ] Delete category works
- [ ] Categories appear in storefront

### Product Image Upload
- [ ] Image URL input accepts URLs
- [ ] Images display correctly in admin
- [ ] Images display in storefront

## Responsive Design

### Desktop (1024px+)
- [ ] Full navbar with all links
- [ ] Products in 3-column grid
- [ ] Side-by-side checkout layout
- [ ] Full admin navigation

### Tablet (768px - 1023px)
- [ ] Navbar with most links
- [ ] Products in 2-column grid
- [ ] Stacked checkout layout
- [ ] Admin navigation visible

### Mobile (< 768px)
- [ ] Hamburger menu in navbar
- [ ] Products in single column
- [ ] Full-width cart and checkout
- [ ] Accessible touch targets

## Visual Checkpoints

### Colors
- [ ] Primary color is red (#dc2626 or similar)
- [ ] Accent color is blue (#2563eb or similar)
- [ ] Background is white
- [ ] Text is readable
- [ ] Borders are subtle gray

### Typography
- [ ] Headings are bold and large
- [ ] Body text is readable
- [ ] Font weights are consistent
- [ ] Line heights are comfortable

### Spacing
- [ ] Consistent padding/margins
- [ ] Cards have proper spacing
- [ ] Sections are clearly separated

### Shadows & Borders
- [ ] Cards have subtle shadows
- [ ] Borders are visible but not overwhelming
- [ ] Hover states have shadows

## Demo Flow Testing

### Complete Customer Flow
1. [ ] Visit homepage
2. [ ] Click on featured product
3. [ ] Add to cart
4. [ ] Continue shopping
5. [ ] Add another product
6. [ ] Go to cart
7. [ ] Verify items and total
8. [ ] Proceed to checkout
9. [ ] Login or sign up
10. [ ] Complete order
11. [ ] View order confirmation
12. [ ] Continue shopping

### Complete Admin Flow
1. [ ] Login as admin
2. [ ] Access admin dashboard
3. [ ] View product list
4. [ ] Create new category
5. [ ] Create new product
6. [ ] Edit product
7. [ ] Change product status
8. [ ] Delete test product
9. [ ] Logout

## Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Error States

- [ ] Network error shows appropriate message
- [ ] 404 page displays for unknown routes
- [ ] Product not found shows message
- [ ] Order not found shows message
- [ ] Form validation errors display inline

## Performance

- [ ] Homepage loads in under 3 seconds
- [ ] Product images load
- [ ] No layout shift on load
- [ ] Transitions are smooth
