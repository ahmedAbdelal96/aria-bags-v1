export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  CircleDollarSign,
  Package,
  Plus,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock3,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAdminCategories } from '@/lib/admin/categories'
import { getAdminOrders } from '@/lib/admin/orders'
import { getAdminProducts } from '@/lib/admin/products'
import { formatPrice, getTotalStock, normalizeProduct } from '@/lib/product'
import { AdminPageHeader, AdminStatCard, AdminStatusBadge } from '@/components/admin/admin-components'
import {
  isActiveOrderStatus,
  normalizeOrderStatus,
} from '@/lib/order-status'

export default async function AdminDashboardPage() {
  const [orders, products, categories] = await Promise.all([
    getAdminOrders().catch(() => []),
    getAdminProducts().catch(() => []),
    getAdminCategories().catch(() => []),
  ])

  const normalizedOrders = orders.map((order) => ({
    ...order,
    status: normalizeOrderStatus(order.status),
  }))
  const activeOrders = normalizedOrders.filter((order) => isActiveOrderStatus(order.status))
  const activeProducts = products.filter((product) => product.status === 'active')
  const lowStockProducts = products.filter(
    (product) => getTotalStock(normalizeProduct(product as unknown as Record<string, unknown>)) <= 5,
  )
  const totalCodSales = normalizedOrders
    .filter((order) => order.status === 'delivered')
    .reduce((sum, order) => sum + order.total_amount, 0)

  const pendingConfirmationOrders = normalizedOrders.filter((order) => order.status === 'pending_confirmation').length
  const confirmedOrders = normalizedOrders.filter((order) => order.status === 'confirmed').length
  const shippingOrders = normalizedOrders.filter((order) => order.status === 'shipping').length
  const deliveredOrders = normalizedOrders.filter((order) => order.status === 'delivered').length
  const cancelledReturnedOrders = normalizedOrders.filter(
    (order) => order.status === 'cancelled' || order.status === 'returned',
  ).length
  const deliveredToday = normalizedOrders.filter((order) => {
    if (order.status !== 'delivered' || !order.delivered_at) return false
    const deliveredAt = new Date(order.delivered_at)
    const now = new Date()
    return (
      deliveredAt.getFullYear() === now.getFullYear() &&
      deliveredAt.getMonth() === now.getMonth() &&
      deliveredAt.getDate() === now.getDate()
    )
  }).length
  const recentOrders = (activeOrders.length > 0 ? activeOrders : normalizedOrders).slice(0, 5)

  const stats = [
    {
      title: 'Active orders',
      value: activeOrders.length,
      description: 'Pending confirmation, confirmed, and shipping',
      icon: ShoppingBag,
    },
    {
      title: 'Pending confirmation',
      value: pendingConfirmationOrders,
      description: 'Waiting for a phone call',
      icon: Clock3,
    },
    {
      title: 'Confirmed',
      value: confirmedOrders,
      description: 'Customer confirmed the order',
      icon: Truck,
    },
    {
      title: 'Shipping',
      value: shippingOrders,
      description: 'Out for delivery',
      icon: Truck,
    },
    {
      title: 'Delivered today',
      value: deliveredToday,
      description: 'Completed today',
      icon: CheckCircle2,
    },
    {
      title: 'Cancelled / returned',
      value: cancelledReturnedOrders,
      description: 'Closed without delivery',
      icon: AlertTriangle,
    },
    {
      title: 'Total COD sales',
      value: formatPrice(totalCodSales),
      description: 'Delivered orders only',
      icon: CircleDollarSign,
    },
    {
      title: 'Delivered orders',
      value: deliveredOrders,
      description: 'Completed order handoffs',
      icon: CheckCircle2,
    },
    {
      title: 'Active products',
      value: activeProducts.length,
      description: 'Visible in the storefront',
      icon: Package,
    },
    {
      title: 'Low stock products',
      value: lowStockProducts.length,
      description: 'Five units or fewer remaining',
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="space-y-6 font-sans">
      <AdminPageHeader
        title="Dashboard"
        description="Daily store operations at a glance for the ARIA handbag collection."
      >
        <Button asChild className="h-10 rounded-lg bg-admin-primary px-4 text-xs font-semibold text-white hover:bg-admin-primary-hover border-0 shadow-sm cursor-pointer transition-colors">
          <Link href="/admin/products/new" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-lg border-admin-border bg-admin-card px-4 text-xs font-semibold hover:bg-admin-soft cursor-pointer text-admin-text transition-colors">
          <Link href="/admin/orders">
            View orders
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-admin-border/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="font-sans text-lg font-bold text-admin-text">Recent orders</CardTitle>
                <CardDescription className="text-xs text-admin-muted-text">
                  Latest five orders with the most important details.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-admin-primary hover:text-admin-primary-hover hover:bg-admin-soft font-semibold cursor-pointer">
                <Link href="/admin/orders" className="flex items-center gap-1">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {recentOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-admin-border bg-admin-soft p-8 text-center space-y-3">
                <ShoppingBag className="mx-auto h-8 w-8 text-admin-muted-text/65" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-admin-text">No orders placed yet</p>
                <p className="text-xs text-admin-muted-text max-w-sm mx-auto leading-relaxed">
                  Your store is live. When customers complete checkout from the storefront, new orders will be tracked here.
                </p>
                <Button asChild size="sm" variant="outline" className="border-admin-border bg-admin-card text-xs font-semibold hover:bg-admin-soft cursor-pointer">
                  <Link href="/" target="_blank">
                    Open Storefront
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-admin-border">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-admin-soft border-b border-admin-border">
                    <tr className="text-xs font-semibold uppercase tracking-wider text-admin-muted-text">
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-admin-soft/40 transition-colors">
                        <td className="px-4 py-3.5 text-sm text-admin-text">
                          <div className="space-y-0.5">
                            <p className="font-semibold">
                              {order.customer_name || order.shipping_address?.full_name || 'Guest order'}
                            </p>
                            <p className="text-xs text-admin-muted-text truncate max-w-[200px]">
                              {order.shipping_address?.address || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-muted-text">
                          <div className="space-y-0.5">
                            <p className="font-medium text-admin-text">
                              {order.customer_phone || order.shipping_address?.phone || '-'}
                            </p>
                            {order.customer_phone_2 ? (
                              <p className="text-xs">{order.customer_phone_2}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-admin-text">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <AdminStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-muted-text">
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

        <div className="space-y-6">
          <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
            <CardHeader className="pb-3 border-b border-admin-border/60">
              <CardTitle className="font-sans text-lg font-bold text-admin-text">Quick actions</CardTitle>
              <CardDescription className="text-xs text-admin-muted-text">
                Fast paths for the most common store tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4">
              <QuickAction href="/admin/products/new" title="Add product" subtitle="Create a new handbag listing" />
              <QuickAction href="/admin/products" title="Manage products" subtitle="Edit pricing, stock, and images" />
              <QuickAction href="/admin/orders" title="View orders" subtitle="Review and update order status" />
              <QuickAction href="/admin/categories" title="Manage categories" subtitle="Organize collections" />
            </CardContent>
          </Card>

          <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
            <CardHeader className="pb-3 border-b border-admin-border/60">
              <CardTitle className="font-sans text-lg font-bold text-admin-text">Catalog notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-sm text-admin-muted-text">
              <div className="flex justify-between items-center py-1.5 border-b border-admin-border/40">
                <span>Active categories:</span>
                <span className="font-semibold text-admin-text">{categories.length}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-admin-border/40">
                <span>Total stocked units:</span>
                <span className="font-semibold text-admin-text">
                  {products.reduce(
                    (sum, product) =>
                      sum + getTotalStock(normalizeProduct(product as unknown as Record<string, unknown>)),
                    0,
                  )}
                </span>
              </div>
              <div className="bg-admin-soft border border-admin-border rounded-lg p-3 text-xs leading-relaxed text-admin-muted-text">
                Low stock items should be checked first before promotions or restocks.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  title,
  subtitle,
}: {
  href: string
  title: string
  subtitle: string
}) {
  return (
    <Link href={href} className="block group">
      <div className="rounded-xl border border-admin-border bg-admin-card p-4 transition-all duration-150 group-hover:border-admin-primary/50 group-hover:bg-admin-soft cursor-pointer">
        <p className="font-sans text-sm font-bold text-admin-text group-hover:text-admin-primary">{title}</p>
        <p className="mt-1 text-xs text-admin-muted-text">{subtitle}</p>
      </div>
    </Link>
  )
}
