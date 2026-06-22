'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, Loader2, Package, MapPin, Mail, Phone, CreditCard } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/aria/empty-state'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, normalizeProduct } from '@/lib/product'
import type { Order, Product } from '@/lib/types'

interface OrderItem {
  id: string
  product_id: string
  color_name: string | null
  color_hex: string | null
  quantity: number
  price: number
  product?: Product | null
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const { id } = await params
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        if (!cancelled) setLoading(false)
        return
      }

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cancelled && orderData) {
        setOrder({
          id: orderData.id,
          user_id: orderData.user_id,
          status: orderData.status,
          total_amount: Number(orderData.total_amount ?? 0),
          payment_method: orderData.payment_method ?? 'cod',
          shipping_address: orderData.shipping_address ?? {
            full_name: '',
            phone: '',
            email: null,
            address: '',
            city: '',
            notes: null,
          },
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
        })

        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, product:products(*)')
          .eq('order_id', id)

        if (itemsData && !cancelled) {
          const normalized = (itemsData as Record<string, unknown>[]).map((row) => ({
            id: row.id as string,
            product_id: row.product_id as string,
            color_name: (row.color_name as string | null) ?? null,
            color_hex: (row.color_hex as string | null) ?? null,
            quantity: Number(row.quantity ?? 1),
            price: Number(row.price ?? 0),
            product: row.product ? normalizeProduct(row.product as Record<string, unknown>) : null,
          }))
          setItems(normalized)
        }
      }

      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [params])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
            <EmptyState
              title="Order not found"
              description="We couldn't find this order. If you just placed it, try refreshing in a moment."
              actionLabel="Back home"
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
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
          {/* Success header */}
          <section className="text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="h-7 w-7" strokeWidth={2} />
            </div>
            <span className="mt-6 block text-xs uppercase tracking-[0.32em] text-primary/80">
              Order confirmed
            </span>
            <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">
              Thank you, {order.shipping_address.full_name.split(' ')[0] || 'you'}.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Your order has been received. We'll be in touch as it makes its way to you.
            </p>
          </section>

          {/* Summary */}
          <section className="mt-12 rounded-xl border border-primary/15 bg-card/60 p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/10 pb-5">
              <h2 className="font-serif text-xl text-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <ul className="mt-5 divide-y divide-primary/10">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-card">
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Package className="h-6 w-6" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-base text-foreground">
                      {item.product?.name ?? 'ARIA piece'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity}
                      {item.color_name ? ` · ${item.color_name}` : ''}
                    </p>
                    {item.color_hex ? (
                      <span
                        aria-hidden
                        className="mt-1 inline-block h-2.5 w-2.5 rounded-full border border-primary/30 align-middle"
                        style={{ backgroundColor: item.color_hex }}
                      />
                    ) : null}
                  </div>
                  <span className="font-serif text-base text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-primary/15 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-foreground">{formatPrice(order.total_amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-foreground">Complimentary</dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-primary/15">
                <dt className="font-serif text-base text-foreground">Total</dt>
                <dd className="font-serif text-2xl text-primary">{formatPrice(order.total_amount)}</dd>
              </div>
            </dl>
          </section>

          {/* Delivery + payment details */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-primary/15 bg-card/60 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
                <MapPin className="h-3.5 w-3.5" />
                Delivering to
              </div>
              <p className="mt-3 font-serif text-base text-foreground">
                {order.shipping_address.full_name}
              </p>
              <p className="text-sm text-muted-foreground">{order.shipping_address.address}</p>
              <p className="text-sm text-muted-foreground">{order.shipping_address.city}</p>
              {order.shipping_address.notes ? (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  “{order.shipping_address.notes}”
                </p>
              ) : null}
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                {order.shipping_address.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {order.shipping_address.phone}
                  </p>
                ) : null}
                {order.shipping_address.email ? (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3 w-3" /> {order.shipping_address.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-primary/15 bg-card/60 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
                <CreditCard className="h-3.5 w-3.5" />
                Payment
              </div>
              <p className="mt-3 font-serif text-base text-foreground">Cash on delivery</p>
              <p className="text-sm text-muted-foreground">
                You'll pay in cash when your order is delivered.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Status:{' '}
                <span className="text-foreground">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 uppercase tracking-[0.22em] text-xs"
            >
              <Link href="/account/orders">View my orders</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-none border-primary/40 px-8 uppercase tracking-[0.22em] text-xs"
            >
              <Link href="/">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}