'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { EmptyState } from '@/components/aria/empty-state'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/product'
import type { Order } from '@/lib/types'

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
}

const STATUS_COLOR: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-zinc-200 text-zinc-700',
  failed: 'bg-rose-100 text-rose-800',
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(
          data.map((row) => ({
            id: row.id,
            user_id: row.user_id,
            status: row.status,
            total_amount: Number(row.total_amount ?? 0),
            payment_method: row.payment_method ?? 'cod',
            shipping_address: row.shipping_address ?? {
              full_name: '',
              phone: '',
              email: null,
              address: '',
              city: '',
              notes: null,
            },
            created_at: row.created_at,
            updated_at: row.updated_at,
          })),
        )
      }
      setLoading(false)
    }
    run()
  }, [])

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
          <span className="text-xs uppercase tracking-[0.32em] text-primary/80">My account</span>
          <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">My orders</h1>

          <div className="mt-10">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No orders yet"
                description="When you place your first order, it will appear here."
                actionLabel="Browse the collection"
                actionHref="/"
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-primary/15 bg-card/60">
                    <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Package className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-serif text-lg text-foreground">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                            {' · '}
                            <span className="uppercase tracking-wide">{order.payment_method}</span>
                          </p>
                          {order.shipping_address?.city ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Shipping to {order.shipping_address.city}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status] ?? 'bg-zinc-100 text-zinc-700'}`}
                        >
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                        <span className="font-serif text-lg text-primary">
                          {formatPrice(order.total_amount)}
                        </span>
                        <Button asChild variant="ghost" size="icon" aria-label="View order">
                          <Link href={`/order-confirmation/${order.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}