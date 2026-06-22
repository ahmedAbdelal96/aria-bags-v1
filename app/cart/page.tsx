'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Package, ShieldCheck, Truck, X } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/aria/quantity-selector'
import { EmptyState } from '@/components/aria/empty-state'
import { useCart } from '@/lib/store/cart'
import { formatPrice } from '@/lib/product'

function linePrice(price: number, salePrice: number | null | undefined, quantity: number) {
  const unit = salePrice != null && salePrice > 0 ? salePrice : price
  return unit * quantity
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const total = getTotal()
  const shipping = total > 0 ? 0 : 0 // complimentary
  const grandTotal = total + shipping

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Bag</span>
          <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">Your shopping bag</h1>

          {items.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                icon={Package}
                title="Your bag is empty"
                description="Start curating your collection — your future favourite is one click away."
                actionLabel="Explore the collection"
                actionHref="/"
              />
            </div>
          ) : (
            <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => {
                  const key = `${item.product_id}::${item.color?.name ?? ''}`
                  const unitPrice =
                    item.product.sale_price != null && item.product.sale_price > 0
                      ? item.product.sale_price
                      : item.product.price
                  return (
                    <article
                      key={key}
                      className="grid grid-cols-[100px_1fr] gap-4 rounded-xl border border-primary/15 bg-card/60 p-4 sm:grid-cols-[120px_1fr] sm:p-5"
                    >
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative block aspect-[4/5] overflow-hidden rounded-md bg-card"
                      >
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Package className="h-8 w-8" strokeWidth={1.25} />
                          </div>
                        )}
                      </Link>

                      <div className="flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="font-serif text-lg text-foreground hover:text-primary transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            {item.color ? (
                              <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span
                                  aria-hidden
                                  className="inline-block h-3 w-3 rounded-full border border-primary/30"
                                  style={{ backgroundColor: item.color.hex }}
                                />
                                {item.color.name}
                              </p>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id, item.color?.name)}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(q) => updateQuantity(item.product_id, q, item.color?.name)}
                            max={item.color ? Math.max(1, item.color.stock) : 10}
                          />
                          <div className="text-right">
                            <p className="font-serif text-lg text-primary">
                              {formatPrice(linePrice(item.product.price, item.product.sale_price, item.quantity))}
                            </p>
                            {item.product.sale_price != null && item.product.sale_price > 0 ? (
                              <p className="text-xs text-muted-foreground">
                                {formatPrice(unitPrice)} each
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}

                <div className="flex justify-end pt-2">
                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-destructive"
                  >
                    Clear bag
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <aside className="h-fit lg:sticky lg:top-24">
                <div className="rounded-xl border border-primary/15 bg-card/60 p-6">
                  <h2 className="font-serif text-xl text-foreground">Order summary</h2>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="text-foreground">{formatPrice(total)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd className="text-foreground">
                        {shipping === 0 ? 'Complimentary' : formatPrice(shipping)}
                      </dd>
                    </div>
                    <div className="border-t border-primary/15 pt-3 flex items-center justify-between">
                      <dt className="font-serif text-base text-foreground">Total</dt>
                      <dd className="font-serif text-2xl text-primary">
                        {formatPrice(grandTotal)}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    asChild
                    size="lg"
                    className="mt-6 h-12 w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-[0.22em] text-xs"
                  >
                    <Link href="/checkout">
                      Proceed to checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="mt-6 space-y-2 border-t border-primary/10 pt-4 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      Complimentary shipping on every order
                    </p>
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      Secure checkout & 14-day returns
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}