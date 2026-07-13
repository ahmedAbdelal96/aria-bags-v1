'use client'

import Link from 'next/link'
import { ShoppingBag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DebugImage } from '@/components/aria/debug-image'
import { useCart } from '@/lib/store/cart'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  categorySlug?: string
  priority?: boolean
  className?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function ProductCard({ product, categorySlug, priority, className }: ProductCardProps) {
  const { addItem } = useCart()
  const productLink = `/products/${product.slug}`

  const cover = product.images[0] ?? product.image_url
  const hasSale = product.sale_price != null && product.sale_price > 0 && product.sale_price < product.price
  const finalPrice = hasSale ? product.sale_price! : product.price
  const colorPreview = product.colors.slice(0, 3)
  const stockCount = product.colors.reduce((sum, color) => sum + Math.max(0, color.stock), 0)
  const categoryLabel = categorySlug
    ? categorySlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : 'ARIA Collection'

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)] transition-transform duration-300 ease-out hover:-translate-y-1 aria-card-hover',
        className,
      )}
    >
      <Link
        href={productLink}
        aria-label={product.name}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-card"
      >
        {cover ? (
          <DebugImage
            src={cover}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover aria-zoom-img"
            scope="product-card"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f8f1df] to-[#e8ddc8]">
            <Package className="h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
          </div>
        )}

        {product.is_featured ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-primary/95 px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm">
            Featured
          </span>
        ) : null}

        {hasSale ? (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-destructive px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-destructive-foreground shadow-sm">
            Sale
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
            <span>{categoryLabel}</span>
            {stockCount > 0 ? (
              <span className="text-[9px] font-semibold uppercase tracking-[0.05em] text-emerald-700">
                In stock
              </span>
            ) : (
              <span className="text-[9px] font-semibold uppercase tracking-[0.05em] text-rose-600">
                Sold out
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg leading-tight text-foreground">
            <Link href={productLink} className="hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </Link>
          </h3>
        </div>

        {product.short_description ? (
          <p className="text-xs leading-relaxed text-muted-foreground/80 line-clamp-1">
            {product.short_description}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 min-h-4">
          {colorPreview.length > 1 ? (
            <div className="flex items-center gap-1">
              {colorPreview.map((color) => (
                <span
                  key={color.name}
                  className="h-3 w-3 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          ) : <div />}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2.5 border-t border-border/60">
          <div className="flex flex-col">
            <span className="text-base font-serif font-bold text-primary">
              {formatPrice(finalPrice)}
            </span>
            {hasSale ? (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
            }}
            className="h-9 rounded-full bg-primary px-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1" />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
