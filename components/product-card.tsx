'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  const cover = product.image_url
  const hasSale = product.sale_price != null && product.sale_price > 0 && product.sale_price < product.price
  const finalPrice = hasSale ? product.sale_price! : product.price

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-card/60 aria-card-hover',
        className,
      )}
    >
      <Link
        href={productLink}
        aria-label={product.name}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-card"
      >
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover aria-zoom-img"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card to-background">
            <Package className="h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
          </div>
        )}

        {product.is_featured ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary-foreground">
            Featured
          </span>
        ) : null}

        {hasSale ? (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-destructive px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-destructive-foreground">
            Sale
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg leading-snug text-foreground line-clamp-1">
            <Link href={productLink} className="hover:text-primary transition-colors">
              {product.name}
            </Link>
          </h3>
        </div>

        {product.short_description ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-medium text-primary">
              {formatPrice(finalPrice)}
            </span>
            {hasSale ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            ) : null}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
            }}
            className="h-9 border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </article>
  )
}