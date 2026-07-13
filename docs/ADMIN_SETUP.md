# ARIA Admin Setup

This project uses Supabase Auth for admin/store management only.
Customers do not sign up or log in on the storefront. They check out as guests.

## Profiles schema

The admin guard expects `public.profiles` to have:

- `id`
- `email`
- `is_admin`

The app also uses `created_at` and `updated_at` for display and sorting.

## 1. Create an admin user in Supabase Auth

1. Open the Supabase dashboard for this project.
2. Go to **Authentication**.
3. Create a new user with the admin email address.
4. Confirm the email if your project requires confirmation.
5. Sign in once with that email and password to create the auth session.

## 2. Mark the user as admin in `profiles`

After the auth user exists, mark the matching profile row as admin.

Use the email address for the user you created:

```sql
update public.profiles
set is_admin = true
where email = 'admin@example.com';
```

If the profile row does not exist yet, create it first with the auth user UUID.
The safest pattern is to create the profile from the app or by copying the auth user id:

```sql
insert into public.profiles (id, email, is_admin)
values ('00000000-0000-0000-0000-000000000000', 'admin@example.com', true)
on conflict (id) do update
set email = excluded.email,
    is_admin = excluded.is_admin;
```

Replace the UUID with the real Supabase Auth user id.

Important: the profile `id` must match the auth user UUID exactly.
Setting `is_admin = true` on the wrong profile row will still block admin login,
because the app checks the current signed-in user's profile by `id`, not by email alone.

## 2b. Guest checkout schema alignment

If guest checkout starts failing with missing `orders` columns, apply the forward-only
guest checkout migration in `supabase/migrations/012_fix_guest_checkout_rpc_and_orders_schema.sql`.
It repairs the RPC and order/order-item shape without weakening admin security or RLS.

## 3. Test access

Use these scenarios:

- Guest user:
  - Open `/admin`
  - Expected: redirect to `/admin/login?next=/admin`

- Logged-in non-admin:
  - Sign in with a normal auth user
  - Expected: login succeeds, then `/admin` access is denied and the user is sent away from the dashboard

- Logged-in admin:
  - Sign in with the admin account
  - Expected: `/admin` opens normally

## 4. Reset password

If the admin forgets the password:

1. Open Supabase Authentication.
2. Find the user.
3. Send a password reset email or set a new password from the dashboard.
4. Log in again at `/admin/login`.

## 5. Security warnings

- Never expose the service role key in any `NEXT_PUBLIC_*` variable.
- Do not make admin checks client-only.
- Keep the server-side guard in `/admin` and the RLS policies as the real protection layer.
- Client-side admin checks are only for friendly UX, not security.

## 6. Quick smoke test

After setup, verify:

1. `/admin` as a guest redirects to login.
2. `/admin/login?next=/admin` returns to the dashboard after a successful admin sign-in.
3. A non-admin account cannot stay in `/admin`.
4. Logout clears the session and `/admin` is inaccessible again.

## 7. Storage configuration (Supabase Storage)

The product image upload feature expects a public storage bucket named `product-images` to exist in Supabase Storage with the following specifications:

- **Bucket name**: `product-images`
- **Public access**: Enabled (allows anyone to view product images via public URLs)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif` (restricts uploads to image formats only)
- **Max file size**: `5MB` (`5242880` bytes)
