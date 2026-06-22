import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, FolderTree, Eye, Download, Star, ShoppingCart, Users, Settings, ArrowRight } from 'lucide-react';
import { getAdminProductStats } from '@/lib/admin/products';
import { getAdminCategories } from '@/lib/admin/categories';
import { getAdminOrderStats } from '@/lib/admin/orders';
import { getAdminCustomerStats } from '@/lib/admin/customers';
import { getAdminProducts } from '@/lib/admin/products';

export default async function AdminDashboardPage() {
  const [productStats, categories, orderStats, customerStats, recentProducts] = await Promise.all([
    getAdminProductStats().catch(() => ({ total: 0, published: 0, draft: 0, archived: 0, featured: 0 })),
    getAdminCategories().catch(() => []),
    getAdminOrderStats().catch(() => ({ total: 0, completed: 0, pending: 0, failed: 0, totalRevenue: 0 })),
    getAdminCustomerStats().catch(() => ({ total: 0, admins: 0, customers: 0 })),
    getAdminProducts().catch(() => []),
  ]);

  const statCards = [
    {
      title: 'Total Products',
      value: productStats.total,
      description: `${productStats.published} published, ${productStats.draft} draft`,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Categories',
      value: categories.length,
      description: 'Product categories',
      icon: FolderTree,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Featured Products',
      value: productStats.featured,
      description: 'Featured on homepage',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Total Views',
      value: recentProducts.reduce((acc, p) => acc + p.views, 0).toLocaleString(),
      description: 'Across all products',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const orderCards = [
    {
      title: 'Total Orders',
      value: orderStats.total,
      description: `${orderStats.pending} pending`,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Customers',
      value: customerStats.total,
      description: `${customerStats.admins} admins, ${customerStats.customers} customers`,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders & Customers */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {orderCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShoppingCart className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Demo Orders</p>
              <p className="text-sm text-amber-800">
                Orders are demo-ready. Real payment confirmation requires Stripe/Paddle webhook integration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/products/new">
          <Card className="hover:border-primary cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Add Product</p>
                  <p className="text-sm text-muted-foreground">Create new product</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categories">
          <Card className="hover:border-primary cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Manage Categories</p>
                  <p className="text-sm text-muted-foreground">Edit categories</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="hover:border-primary cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">View Orders</p>
                  <p className="text-sm text-muted-foreground">See all orders</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:border-primary cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Store Settings</p>
                  <p className="text-sm text-muted-foreground">Configure store</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Products */}
      {recentProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Your most recently updated products</CardDescription>
              </div>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Package className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${product.price.toFixed(2)} • {product.views} views •{' '}
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : product.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
