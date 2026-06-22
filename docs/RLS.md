# Row Level Security (RLS) Policies

This document outlines recommended Row Level Security policies for production deployment.

**IMPORTANT**: The current implementation does NOT have RLS policies enabled. These policies are REQUIRED before going to production to prevent unauthorized access to data.

## Enable RLS

To enable RLS on a table in Supabase SQL Editor:

```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

## Recommended Policies

### Public Read Access (No Authentication Required)

#### Categories - Public Read
```sql
CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
TO public
USING (true);
```

#### Active Products - Public Read
```sql
CREATE POLICY "Public can read active products"
ON public.products
FOR SELECT
TO public
USING (status = 'active');
```

### Authenticated Users

#### Users Can Read Their Own Profile
```sql
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

#### Users Can Update Their Own Profile
```sql
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

#### Users Can Read Their Own Orders
```sql
CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

#### Users Can Read Their Own Order Items
```sql
CREATE POLICY "Users can read own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
```

### Admin Only

#### Admin Can Read All Profiles
```sql
CREATE POLICY "Admin can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid()
    AND p.is_admin = true
  )
);
```

#### Admin Can Update All Profiles
```sql
CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid()
    AND p.is_admin = true
  )
);
```

#### Admin Can Manage Products
```sql
CREATE POLICY "Admin can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admin can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admin can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
```

#### Admin Can Manage Categories
```sql
CREATE POLICY "Admin can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admin can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admin can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
```

#### Admin Can Manage Orders (Read/Update only, not delete)
```sql
CREATE POLICY "Admin can read all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
  OR auth.uid() = user_id
);

CREATE POLICY "Admin can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
```

## Complete RLS Setup Script

Run this in your Supabase SQL Editor to set up all RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
DROP POLICY IF EXISTS "Admin can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;

-- Categories - Public Read
CREATE POLICY "Public can read categories"
ON public.categories FOR SELECT TO public USING (true);

-- Products - Public Read (active only)
CREATE POLICY "Public can read active products"
ON public.products FOR SELECT TO public USING (status = 'active');

-- Profiles - Users can read/update own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Orders - Users can read own orders
CREATE POLICY "Users can read own orders"
ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Order Items - Users can read own order items
CREATE POLICY "Users can read own order items"
ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Admin - Can manage all profiles
CREATE POLICY "Admin can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true));

CREATE POLICY "Admin can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Admin - Can manage products
CREATE POLICY "Admin can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admin can update products"
ON public.products FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admin can delete products"
ON public.products FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Admin - Can manage categories
CREATE POLICY "Admin can insert categories"
ON public.categories FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admin can update categories"
ON public.categories FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admin can delete categories"
ON public.categories FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Admin - Can manage orders
CREATE POLICY "Admin can read all orders"
ON public.orders FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true) OR auth.uid() = user_id);

CREATE POLICY "Admin can update orders"
ON public.orders FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
```

## Testing RLS Policies

After setting up RLS, test that:

1. Public users can view active products and categories
2. Public users CANNOT see inactive or archived products
3. Regular users can view and edit their own profile
4. Regular users can view their own orders
5. Regular users CANNOT view other users' orders
6. Admin users can view and edit all products
7. Admin users can view and edit all categories
8. Admin users can view all orders

## Security Notes

- RLS policies are enforced at the database level
- Even if application code has a bug, RLS provides protection
- Always use `auth.uid()` instead of passing user IDs from the client
- Use `WITH CHECK` for INSERT/UPDATE to validate data
- Use `USING` for SELECT/DELETE to filter rows

## Current Implementation Status

**This project does NOT currently have RLS enabled.** The code relies on client-side checks (like checking `profile.is_admin` in the admin layout), but these can be bypassed.

Before production:
1. Enable RLS on all tables
2. Create appropriate policies
3. Test all access patterns
4. Remove any client-side admin checks that shouldn't be relied upon
