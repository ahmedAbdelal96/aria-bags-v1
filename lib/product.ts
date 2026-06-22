import type { Product, ProductColor } from '@/lib/types'

/**
 * Try to extract colors from a raw Supabase row.
 *
 * Supports a `colors` JSONB column (array of ProductColor) and
 * falls back to an empty array.
 */
export function parseColors(value: unknown): ProductColor[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null)
    .map((v) => ({
      name: typeof v.name === 'string' ? v.name : '',
      hex: typeof v.hex === 'string' ? v.hex : '#000000',
      stock: typeof v.stock === 'number' ? v.stock : Number(v.stock ?? 0),
      sku: typeof v.sku === 'string' ? v.sku : null,
    }))
    .filter((c) => c.name.length > 0)
}

/**
 * Try to extract images array from a raw Supabase row.
 * Falls back to [image_url] when images column is missing.
 */
export function parseImages(value: unknown, fallback: string | null): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
  }
  return fallback ? [fallback] : []
}

/** Convert raw DB row (snake_case + JSONB fields) to Product. */
export function normalizeProduct(row: Record<string, unknown>): Product {
  const images = parseImages(row.images, (row.image_url as string | null) ?? null)
  return {
    id: row.id as string,
    category_id: (row.category_id as string) ?? '',
    name: (row.name as string) ?? '',
    slug: (row.slug as string) ?? '',
    short_description: (row.short_description as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    price: Number(row.price ?? 0),
    sale_price: row.sale_price == null ? null : Number(row.sale_price),
    image_url: (row.image_url as string | null) ?? null,
    images,
    colors: parseColors(row.colors),
    material: (row.material as string | null) ?? null,
    dimensions: (row.dimensions as string | null) ?? null,
    care_instructions: (row.care_instructions as string | null) ?? null,
    status: (row.status as Product['status']) ?? 'active',
    is_featured: Boolean(row.is_featured),
    file_url: (row.file_url as string | null) ?? null,
    file_size: row.file_size == null ? null : Number(row.file_size),
    file_type: (row.file_type as string | null) ?? null,
    is_instant_download: Boolean(row.is_instant_download),
    is_paid_product: row.is_paid_product == null ? true : Boolean(row.is_paid_product),
    download_file_path: (row.download_file_path as string | null) ?? null,
    file_size_bytes: row.file_size_bytes == null ? null : Number(row.file_size_bytes),
    views: Number(row.views ?? 0),
    downloads: Number(row.downloads ?? 0),
    display_order: Number(row.display_order ?? 0),
    created_at: (row.created_at as string) ?? '',
    updated_at: (row.updated_at as string) ?? '',
  }
}

/** Compute the available stock for a product (sum of color stocks, or 0 if no colors). */
export function getTotalStock(product: Product): number {
  if (product.colors.length === 0) return 0
  return product.colors.reduce((acc, c) => acc + Math.max(0, c.stock), 0)
}

export function isInStock(product: Product): boolean {
  if (product.colors.length === 0) return true // legacy products without colors are still sellable
  return getTotalStock(product) > 0
}

/** Format a USD price consistently across the storefront. */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}