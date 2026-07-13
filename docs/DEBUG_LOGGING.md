# ARIA Debug Logging

Enable local-only storefront tracing with environment flags in `.env.local`:

```env
NEXT_PUBLIC_ARIA_DEBUG=true
ARIA_SERVER_DEBUG=true
```

## What each flag does

- `NEXT_PUBLIC_ARIA_DEBUG=true`
  - Enables browser console logs.
  - Also enables server logs because server pages may need to trace the same request path.
- `ARIA_SERVER_DEBUG=true`
  - Enables server terminal logs only.
  - Useful when you want query tracing without browser noise.

## Safety rules

- Do not commit these flags for production unless you explicitly want debug logging there.
- The debug helpers redact obvious secrets, tokens, cookies, and session-like values.
- The logs focus on counts, slugs, image paths, and Supabase error summaries.

## Log labels

Common labels used by the storefront include:

- `[ARIA DEBUG][homepage.products]`
- `[ARIA DEBUG][homepage.newArrivals.count]`
- `[ARIA DEBUG][homepage.featuredProducts.count]`
- `[ARIA DEBUG][homepage.storeSettings]`
- `[ARIA DEBUG][category.requestedSlug]`
- `[ARIA DEBUG][category.categoryResult]`
- `[ARIA DEBUG][category.productsCount]`
- `[ARIA DEBUG][image.error]`

## Tip

If the homepage shows empty sections or `/category/[slug]` returns 404, turn on the flags above and reload the page. The terminal logs will show whether Supabase returned zero rows, a query error, or a fallback to mock data.
