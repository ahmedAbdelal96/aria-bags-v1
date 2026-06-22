'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Truck, ShieldCheck, RefreshCw, Check } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { ProductGallery } from '@/components/aria/product-gallery'
import { ProductGrid } from '@/components/aria/product-grid'
import { ProductDetailSkeleton } from '@/components/aria/product-skeleton'
import { ColorSwatch } from '@/components/aria/color-swatch'
import { QuantitySelector } from '@/components/aria/quantity-selector'
import { EmptyState } from '@/components/aria/empty-state'
import { formatPrice, getTotalStock, isInStock } from '@/lib/product'
import type { Category, Product, ProductColor } from '@/lib/types'

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const { addItem } = useCart()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { slug } = await params
        const supabase = createClient()

        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .maybeSingle()

        if (cancelled) return

        if (productData) {
          const normalized = await import('@/lib/product').then((m) =>
            m.normalizeProduct(productData as Record<string, unknown>),
          )
          setProduct(normalized)
          setSelectedColor(normalized.colors[0] ?? null)
          setQuantity(1)

          const { data: categoryData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', normalized.category_id)
            .maybeSingle()

          if (categoryData) setCategory(categoryData as Category)

          const { data: relatedData } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .neq('id', normalized.id)
            .eq('category_id', normalized.category_id)
            .limit(4)

          if (relatedData && !cancelled) {
            const relatedNormalized = await Promise.all(
              (relatedData as Record<string, unknown>[]).map((row) =>
                import('@/lib/product').then((m) => m.normalizeProduct(row)),
              ),
            )
            setRelated(relatedNormalized)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [params])

  const finalPrice = useMemo(() => {
    if (!product) return 0
    if (product.sale_price != null && product.sale_price > 0) return product.sale_price
    return product.price
  }, [product])

  const totalStock = product ? getTotalStock(product) : 0
  const inStock = product ? isInStock(product) : false

  const handleAdd = () => {
    if (!product) return
    addItem(product, { quantity, color: selectedColor })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
            <ProductDetailSkeleton />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
            <EmptyState
              title="Bag not found"
              description="The piece you're looking for is no longer available."
              actionLabel="Return home"
              actionHref="/"
            />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground"
          >
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-primary/40">/</span>
            {category ? (
              <>
                <Link href={`/category/${category.slug}`} className="hover:text-primary transition-colors">
                  {category.name}
                </Link>
                <span className="text-primary/40">/</span>
              </>
            ) : null}
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Gallery */}
            <ProductGallery
              images={product.images.length > 0 ? product.images : product.image_url ? [product.image_url] : []}
              alt={product.name}
            />

            {/* Info */}
            <div className="flex flex-col gap-7">
              {category ? (
                <span className="text-xs uppercase tracking-[0.32em] text-primary/80">
                  {category.name}
                </span>
              ) : null}

              <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
                {product.name}
              </h1>

              {product.short_description ? (
                <p className="text-base leading-relaxed text-muted-foreground">
                  {product.short_description}
                </p>
              ) : null}

              <div className="flex items-baseline gap-3 border-y border-primary/10 py-5">
                <span className="font-serif text-3xl text-primary">{formatPrice(finalPrice)}</span>
                {product.sale_price != null && product.sale_price > 0 && product.sale_price < product.price ? (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                ) : null}
              </div>

              {/* Color selection */}
              {product.colors.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.22em] text-foreground/80">
                      Colour
                    </span>
                    {selectedColor ? (
                      <span className="text-xs text-muted-foreground">{selectedColor.name}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {product.colors.map((c) => (
                      <ColorSwatch
                        key={c.name}
                        name={c.name}
                        value={c.hex}
                        selected={selectedColor?.name === c.name}
                        onSelect={() => setSelectedColor(c)}
                        disabled={c.stock <= 0}
                      />
                    ))}
                  </div>
                  {selectedColor && selectedColor.stock <= 5 && selectedColor.stock > 0 ? (
                    <p className="text-xs text-primary/80">
                      Only {selectedColor.stock} left in this colour.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-[0.22em] text-foreground/80">
                  Quantity
                </span>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={selectedColor ? Math.max(1, selectedColor.stock) : 10}
                />
              </div>

              {/* Add to cart */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleAdd}
                  disabled={!inStock || (selectedColor != null && selectedColor.stock <= 0)}
                  className="h-14 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-[0.22em] text-xs"
                >
                  {!inStock ? (
                    'Out of stock'
                  ) : added ? (
                    <>
                      <Check className="h-4 w-4" />
                      Added to bag
                    </>
                  ) : (
                    'Add to bag'
                  )}
                </Button>
              </div>

              {/* Stock & trust badges */}
              <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-card/40 p-3">
                  <Truck className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <span className="text-xs leading-snug text-muted-foreground">
                    Complimentary shipping
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-card/40 p-3">
                  <RefreshCw className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <span className="text-xs leading-snug text-muted-foreground">
                    14-day returns
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-card/40 p-3">
                  <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <span className="text-xs leading-snug text-muted-foreground">
                    Lifetime care
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description ? (
                <div className="border-t border-primary/10 pt-6">
                  <h2 className="mb-3 text-xs uppercase tracking-[0.32em] text-primary">
                    Description
                  </h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              ) : null}

              {/* Specs */}
              {(product.material || product.dimensions || product.care_instructions) && (
                <div className="border-t border-primary/10 pt-6">
                  <h2 className="mb-4 text-xs uppercase tracking-[0.32em] text-primary">
                    Details
                  </h2>
                  <dl className="divide-y divide-primary/10 text-sm">
                    {product.material ? (
                      <div className="flex justify-between gap-6 py-3">
                        <dt className="text-muted-foreground">Material</dt>
                        <dd className="text-right text-foreground">{product.material}</dd>
                      </div>
                    ) : null}
                    {product.dimensions ? (
                      <div className="flex justify-between gap-6 py-3">
                        <dt className="text-muted-foreground">Dimensions</dt>
                        <dd className="text-right text-foreground">{product.dimensions}</dd>
                      </div>
                    ) : null}
                    {product.care_instructions ? (
                      <div className="flex justify-between gap-6 py-3">
                        <dt className="text-muted-foreground">Care</dt>
                        <dd className="max-w-[60%] text-right text-foreground">
                          {product.care_instructions}
                        </dd>
                      </div>
                    ) : null}
                    {product.colors.length > 0 ? (
                      <div className="flex justify-between gap-6 py-3">
                        <dt className="text-muted-foreground">Availability</dt>
                        <dd className="text-right text-foreground">
                          {totalStock > 0
                            ? `${totalStock} in stock across colours`
                            : 'Currently unavailable'}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-24 border-t border-primary/10 pt-16">
              <h2 className="font-serif text-2xl text-foreground md:text-3xl">You may also love</h2>
              <div className="mt-8">
                <ProductGrid products={related} />
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

