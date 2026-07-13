'use client'

import { useMemo, useState } from 'react'
import { ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react'
import type { Category, Product, ProductColor } from '@/lib/types'
import { ProductGallery } from '@/components/aria/product-gallery'
import { ProductGrid } from '@/components/aria/product-grid'
import { ColorSwatch } from '@/components/aria/color-swatch'
import { QuantitySelector } from '@/components/aria/quantity-selector'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store/cart'
import { formatPrice, getTotalStock, isInStock } from '@/lib/product'

interface ProductDetailPanelProps {
  product: Product
  category: Category | null
  related: Product[]
}

export function ProductDetailPanel({ product, category, related }: ProductDetailPanelProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(product.colors[0] ?? null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const [openTabs, setOpenTabs] = useState<Record<string, boolean>>({
    material: true,
    dimensions: false,
    care: false,
  })

  const toggleTab = (tab: string) => {
    setOpenTabs((prev) => ({ ...prev, [tab]: !prev[tab] }))
  }

  const finalPrice = useMemo(() => {
    if (product.sale_price != null && product.sale_price > 0) return product.sale_price
    return product.price
  }, [product.sale_price, product.price])

  const totalStock = getTotalStock(product)
  const inStock = isInStock(product)
  const imageSet = product.images.length > 0 ? product.images : product.image_url ? [product.image_url] : []

  const handleAdd = () => {
    addItem(product, { quantity, color: selectedColor })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <ProductGallery
          images={imageSet}
          alt={product.name}
          className="lg:sticky lg:top-24"
        />

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
            {product.is_featured ? <Star className="h-3.5 w-3.5 fill-primary" /> : null}
            {category ? category.name : 'ARIA collection'}
          </div>

          <div className="space-y-3">
            <h1 className="font-serif text-3xl md:text-4xl leading-tight text-foreground">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-primary">{formatPrice(finalPrice)}</span>
              {product.sale_price != null && product.sale_price > 0 && product.sale_price < product.price ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </div>
            
            {product.short_description ? (
              <p className="text-sm leading-relaxed text-muted-foreground/90">
                {product.short_description}
              </p>
            ) : null}
          </div>

          <div className="border-t border-border/60 pt-5">
            {product.colors.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                  <span>Colour</span>
                  {selectedColor ? (
                    <span className="text-xs text-muted-foreground font-medium normal-case tracking-normal">{selectedColor.name}</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <ColorSwatch
                      key={color.name}
                      name={color.name}
                      value={color.hex}
                      selected={selectedColor?.name === color.name}
                      onSelect={() => setSelectedColor(color)}
                      disabled={color.stock <= 0}
                    />
                  ))}
                </div>
                {selectedColor ? (
                  <p className="text-[11px] text-muted-foreground">
                    {selectedColor.stock > 0
                      ? `${selectedColor.stock} available in this color`
                      : 'This color is currently unavailable'}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_-12px_rgba(43,36,32,0.1)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">Quantity</span>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={selectedColor ? Math.max(1, selectedColor.stock) : 10}
                />
              </div>
              {inStock ? (
                <span className="text-xs text-emerald-700 font-semibold uppercase tracking-[0.1em] flex items-center gap-1.5">
                  ● In stock
                </span>
              ) : (
                <span className="text-xs text-rose-600 font-semibold uppercase tracking-[0.1em] flex items-center gap-1.5">
                  ● Sold out
                </span>
              )}
            </div>

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={!inStock || (selectedColor != null && selectedColor.stock <= 0)}
              className="h-14 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-hover uppercase tracking-[0.16em] text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              {added ? 'Added to bag' : 'Add to bag'}
            </Button>
            
            <p className="text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.12em] mt-1">
              ✓ Cash on delivery available across Egypt
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InfoCard
              icon={Truck}
              title="Complimentary shipping"
              description="Elegant delivery at no extra charge."
            />
            <InfoCard
              icon={RefreshCw}
              title="14-day returns"
              description="Simple returns if the piece is not right."
            />
            <InfoCard
              icon={ShieldCheck}
              title="Luxury care"
              description="Care guidance for long-lasting wear."
            />
          </div>

          <div className="border-t border-border mt-8 pt-4 space-y-2">
            {[
              { id: 'material', label: 'Material', value: product.material },
              { id: 'dimensions', label: 'Dimensions', value: product.dimensions },
              { id: 'care', label: 'Care Instructions', value: product.care_instructions },
            ].map((section) => {
              if (!section.value) return null
              const isOpen = openTabs[section.id]
              return (
                <div key={section.id} className="border-b border-border/60 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleTab(section.id)}
                    className="flex w-full items-center justify-between py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{section.label}</span>
                    <span className="text-sm font-medium">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="mt-2 text-xs leading-relaxed text-muted-foreground animate-fade-in">
                      {section.value}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Delivery & returns</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Careful packaging, tracked handoff, and a calm customer experience are part of every ARIA order.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {totalStock > 0
                ? `${totalStock} total units available across colors.`
                : 'This piece is currently unavailable.'}
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-border pt-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">Related pieces</p>
            <h2 className="mt-2 font-serif text-3xl text-foreground">Complete the look</h2>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  )
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Truck
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
      <p className="mt-3 text-xs font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
