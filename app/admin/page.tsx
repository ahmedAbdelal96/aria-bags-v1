import Link from 'next/link'
import {
  Package,
  FolderTree,
  Star,
  ShoppingBag,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAdminProductStats, getAdminProducts } from '@/lib/admin/products'
import { getAdminCategories } from '@/lib/admin/categories'
import { getAdminOrderStats } from '@/lib/admin/orders'
import { getAdminCustomerStats } from '@/lib/admin/customers'
import { formatPrice, getTotalStock, normalizeProduct } from '@/lib/product'

export default async function AdminDashboardPage() {
  const [productStats, categories, orderStats, customerStats, recentRows] = await Promise.all([
    getAdminProductStats().catch(() => ({ total: 0, published: 0, draft: 0, archived: 0, featured: 0 })),
    getAdminCategories().catch(() => []),
    getAdminOrderStats().catch(() => ({ total: 0, completed: 0, pending: 0, failed: 0, totalRevenue: 0 })),
    getAdminCustomerStats().catch(() => ({ total: 0, admins: 0, customers: 0 })),
    Promise.resolve(),
  ])

  // Fetch recent products separately to apply normalization
  const recentProducts = await getAdminProducts().catch(() => [])
  const recent = recentProducts.slice(0, 5)

  const totalStock = recentProducts.reduce(
    (acc, p) => acc + getTotalStock(normalizeProduct(p as unknown as Record<string, unknown>)),
    0,
  )

  const stats = [
    {
      title: 'Products',
      value: productStats.total,
      description: `${productStats.published} active · ${productStats.draft} draft`,
      icon: Package,
    },
    {
      title: 'Collections',
      value: categories.length,
      description: 'Categories defined',
      icon: FolderTree,
    },
    {
      title: 'Featured',
      value: productStats.featured,
      description: 'On homepage',
      icon: Star,
    },
    {
      title: 'Stock units',
      value: totalStock,
      description: 'Across all colours',
      icon: Sparkles,
    },
  ]

  const secondaryStats = [
    {
      title: 'Orders',
      value: orderStats.total,
      description: `${orderStats.pending} pending`,
      icon: ShoppingBag,
    },
    {
      title: 'Customers',
      value: customerStats.total,
      description: `${customerStats.customers} customers · ${customerStats.admins} admins`,
      icon: Users,
    },
    {
      title: 'Revenue',
      value: formatPrice(orderStats.totalRevenue),
      description: 'Completed orders',
      icon: ShoppingBag,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Admin</span>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your ARIA store.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title} className="border-primary/15 bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {s.title}
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl text-foreground">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {secondaryStats.map((s) => (
          <Card key={s.title} className="border-primary/15 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-2xl text-foreground">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickAction href="/admin/products/new" title="Add product" subtitle="Create a new ARIA piece" />
        <QuickAction href="/admin/categories" title="Manage collections" subtitle="Organise your store" />
        <QuickAction href="/admin/orders" title="View orders" subtitle="Track customer orders" />
        <QuickAction href="/admin/settings" title="Store settings" subtitle="Configure homepage copy" />
      </div>

      {/* Recent products */}
      {recent.length > 0 && (
        <Card className="border-primary/15 bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-xl">Recent products</CardTitle>
                <CardDescription>Your most recently updated pieces.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/products">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent.map((raw) => {
                const product = normalizeProduct(raw as unknown as Record<string, unknown>)
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b border-primary/10 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-card">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Package className="h-4 w-4" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(product.sale_price ?? product.price)} ·{' '}
                          {product.status === 'active'
                            ? 'Active'
                            : product.status === 'draft'
                              ? 'Draft'
                              : 'Archived'}
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/products/${product.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
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
    <Link href={href}>
      <Card className="border-primary/15 bg-card/60 hover:border-primary transition-colors">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="font-serif text-base text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  )
}