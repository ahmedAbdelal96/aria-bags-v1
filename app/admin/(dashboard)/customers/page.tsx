'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/aria/empty-state'
import { AlertTriangle, CheckCircle2, Users, DollarSign, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/product'
import { AdminPageHeader, AdminStatCard, AdminStatusBadge } from '@/components/admin/admin-components'
import { normalizeOrderStatus } from '@/lib/order-status'

interface CustomerGroup {
  phone: string
  name: string
  phone_2: string | null
  address: string
  ordersCount: number
  deliveredOrdersCount: number
  cancelledReturnedOrdersCount: number
  totalSpent: number
  lastOrderDate: string
  lastOrderStatus: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerGroup[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('orders')
      .select('customer_name, customer_phone, customer_phone_2, shipping_address, total_amount, status, delivered_at, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setTotalOrders(data.length)
          const salesSum = data
            .filter(o => normalizeOrderStatus(o.status) === 'delivered')
            .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
          setTotalSales(salesSum)

          const groups: Record<string, CustomerGroup> = {}
          data.forEach(order => {
            const rawPhone = order.customer_phone || order.shipping_address?.phone || ''
            const normalizedPhone = rawPhone.replace(/[()\s-]/g, '')

            if (!normalizedPhone) return

            const normalizedStatus = normalizeOrderStatus(order.status)
            const name = order.customer_name || order.shipping_address?.full_name || 'Guest Customer'
            const phone_2 = order.customer_phone_2 || order.shipping_address?.phone_2 || null
            const address = order.shipping_address?.address || '-'
            const amount = Number(order.total_amount || 0)

            if (!groups[normalizedPhone]) {
              groups[normalizedPhone] = {
                phone: rawPhone,
                name,
                phone_2,
                address,
                ordersCount: 1,
                deliveredOrdersCount: normalizedStatus === 'delivered' ? 1 : 0,
                cancelledReturnedOrdersCount:
                  normalizedStatus === 'cancelled' || normalizedStatus === 'returned' ? 1 : 0,
                totalSpent: amount,
                lastOrderDate: order.created_at,
                lastOrderStatus: order.status,
              }
            } else {
              groups[normalizedPhone].ordersCount += 1
              groups[normalizedPhone].deliveredOrdersCount += normalizedStatus === 'delivered' ? 1 : 0
              groups[normalizedPhone].cancelledReturnedOrdersCount +=
                normalizedStatus === 'cancelled' || normalizedStatus === 'returned' ? 1 : 0
              if (normalizedStatus === 'delivered') {
                groups[normalizedPhone].totalSpent += amount
              }
            }
          })

          setCustomers(Object.values(groups))
        }
        setLoading(false)
      })
  }, [])

  const stats = {
    totalCustomers: customers.length,
    totalOrders,
    deliveredOrders: customers.reduce((sum, customer) => sum + customer.deliveredOrdersCount, 0),
    cancelledReturnedOrders: customers.reduce((sum, customer) => sum + customer.cancelledReturnedOrdersCount, 0),
    totalSales,
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminPageHeader
        title="Customers"
        description="View customer lifetime value and order frequency from shop orders."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard icon={Users} title="Total customers" value={stats.totalCustomers} />
        <AdminStatCard icon={ShoppingBag} title="Total orders" value={stats.totalOrders} />
        <AdminStatCard icon={CheckCircle2} title="Delivered orders" value={stats.deliveredOrders} />
        <AdminStatCard icon={AlertTriangle} title="Cancelled / returned" value={stats.cancelledReturnedOrders} />
        <AdminStatCard icon={DollarSign} title="Delivered sales" value={formatPrice(stats.totalSales)} />
      </div>

      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
        <CardHeader className="pb-3 border-b border-admin-border/60">
          <CardTitle className="font-sans text-base font-bold text-admin-text">All customers ({customers.length})</CardTitle>
          <CardDescription className="text-xs text-admin-muted-text">Customer profiles generated automatically from guest checkout orders.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Customers will appear after their first order."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-admin-border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-admin-soft border-b border-admin-border">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-admin-muted-text">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Latest address</th>
                    <th className="px-4 py-3 text-center">Orders</th>
                    <th className="px-4 py-3 text-center">Delivered</th>
                    <th className="px-4 py-3 text-center">Cancelled / returned</th>
                    <th className="px-4 py-3">Total spent</th>
                    <th className="px-4 py-3">Last order date</th>
                    <th className="px-4 py-3">Last order status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {customers.map((c, idx) => (
                    <tr key={`${c.phone}-${idx}`} className="hover:bg-admin-soft/40 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-admin-text font-semibold">
                        {c.name}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-admin-muted-text">
                        <div className="space-y-0.5">
                          <p className="font-medium text-admin-text">{c.phone}</p>
                          {c.phone_2 ? <p className="text-xs">Alt: {c.phone_2}</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-admin-muted-text leading-relaxed max-w-[220px] truncate" title={c.address}>
                        {c.address}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-admin-text font-semibold text-center">
                        {c.ordersCount}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-admin-text font-semibold text-center">
                        {c.deliveredOrdersCount}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-admin-text font-semibold text-center">
                        {c.cancelledReturnedOrdersCount}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-admin-primary font-bold">
                        {formatPrice(c.totalSpent)}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-admin-muted-text">
                        {new Date(c.lastOrderDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <AdminStatusBadge status={c.lastOrderStatus} />
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
