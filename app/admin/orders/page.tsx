'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/aria/empty-state'
import { ShoppingBag, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/product'
import type { Order } from '@/lib/types'

interface OrderWithDetails extends Order {
  customer_email?: string
  item_count?: number
}

const STATUS_OPTIONS: Order['status'][] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'failed',
]

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
}

const STATUS_STYLES: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-zinc-200 text-zinc-700',
  failed: 'bg-rose-100 text-rose-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      const detailed: OrderWithDetails[] = []
      for (const order of ordersData || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', order.user_id)
          .maybeSingle()

        const { count } = await supabase
          .from('order_items')
          .select('id', { count: 'exact', head: true })
          .eq('order_id', order.id)

        detailed.push({
          id: order.id,
          user_id: order.user_id,
          status: order.status,
          total_amount: Number(order.total_amount ?? 0),
          payment_method: order.payment_method ?? 'cod',
          shipping_address: order.shipping_address ?? {
            full_name: '',
            phone: '',
            email: null,
            address: '',
            city: '',
            notes: null,
          },
          created_at: order.created_at,
          updated_at: order.updated_at,
          customer_email: profile?.email ?? 'Unknown',
          item_count: count ?? 0,
        })
      }

      setOrders(detailed)
      setLoading(false)
    }
    run()
  }, [])

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    }
  }

  const totalRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0)

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    fulfilled: orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Admin</span>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">Manage customer orders and fulfilment.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={ShoppingBag} label="Total" value={stats.total} />
        <Stat icon={Clock} label="Open" value={stats.pending} />
        <Stat icon={Truck} label="Shipped" value={stats.shipped} />
        <Stat icon={CheckCircle} label="Revenue" value={formatPrice(totalRevenue)} />
      </div>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">All orders ({orders.length})</CardTitle>
          <CardDescription>Customer purchase orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="Orders will appear here as customers complete checkout."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/15 text-left text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-primary/10 hover:bg-primary/5">
                      <td className="px-4 py-3">
                        <code className="text-xs text-foreground">#{order.id.slice(0, 8).toUpperCase()}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{order.customer_email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {order.shipping_address?.city || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{order.item_count}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as Order['status'])
                          }
                          className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag
  label: string
  value: number | string
}) {
  return (
    <Card className="border-primary/15 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-serif text-2xl text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}