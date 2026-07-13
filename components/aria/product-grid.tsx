import type { Product } from '@/lib/types'
import { ProductCard } from '@/components/product-card'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: Product[]
  categorySlug?: string
  className?: string
}

export function ProductGrid({ products, categorySlug, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          categorySlug={categorySlug}
          priority={i < 3}
        />
      ))}
    </div>
  )
}