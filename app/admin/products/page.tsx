'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Star,
  Copy,
  Archive,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/aria/empty-state'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, getTotalStock, normalizeProduct } from '@/lib/product'
import type { Product, Category } from '@/lib/types'

const STATUS_LABEL: Record<Product['status'], string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
}

const STATUS_STYLES: Record<Product['status'], string> = {
  active: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-amber-100 text-amber-800',
  archived: 'bg-zinc-200 text-zinc-700',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'true' | 'false'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    const supabase = createClient()
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    if (categoryFilter !== 'all') {
      query = query.eq('category_id', categoryFilter)
    }
    if (featuredFilter !== 'all') {
      query = query.eq('is_featured', featuredFilter === 'true')
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (!error && data) {
      setProducts(data.map((row) => normalizeProduct(row as Record<string, unknown>)))
    }
    setLoading(false)
  }, [statusFilter, categoryFilter, featuredFilter, search])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data as Category[])
      })
    fetchProducts()
  }, [fetchProducts])

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? '—'

  const handleStatusChange = async (id: string, newStatus: Product['status']) => {
    setActionLoading(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id)
    if (!error) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)))
    }
    setActionLoading(null)
  }

  const handleFeaturedToggle = async (id: string, featured: boolean) => {
    setActionLoading(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ is_featured: featured }).eq('id', id)
    if (!error) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_featured: featured } : p)))
    }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setActionLoading(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } else {
      alert('Failed to delete product.')
    }
    setActionLoading(null)
  }

  const handleDuplicate = async (product: Product) => {
    setActionLoading(product.id)
    const supabase = createClient()
    const { error } = await supabase.from('products').insert([
      {
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
        short_description: product.short_description,
        description: product.description,
        price: product.price,
        sale_price: product.sale_price,
        category_id: product.category_id,
        image_url: product.image_url,
        images: product.images,
        colors: product.colors,
        material: product.material,
        dimensions: product.dimensions,
        care_instructions: product.care_instructions,
        status: 'draft',
        is_featured: false,
      },
    ])
    if (!error) {
      fetchProducts()
    } else {
      alert('Failed to duplicate product.')
    }
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Admin</span>
          <h1 className="mt-2 font-serif text-3xl text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your ARIA pieces.</p>
        </div>
        <Button
          asChild
          className="h-11 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-6 uppercase tracking-[0.22em] text-xs"
        >
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            New product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-primary/15 bg-card/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-foreground/80">
            <Filter className="h-4 w-4 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as 'all' | 'true' | 'false')}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All pieces</option>
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">All products ({products.length})</CardTitle>
          <CardDescription>
            {products.length} {products.length === 1 ? 'piece' : 'pieces'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Add your first ARIA piece to get started."
              actionLabel="Add product"
              actionHref="/admin/products/new"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/15 text-left text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stock = getTotalStock(product)
                    return (
                      <tr key={product.id} className="border-b border-primary/10 hover:bg-primary/5">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-card">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                  <Package className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {getCategoryName(product.category_id)}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          <div className="flex items-baseline gap-2">
                            <span>{formatPrice(product.sale_price ?? product.price)}</span>
                            {product.sale_price != null && product.sale_price > 0 ? (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.price)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {product.colors.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span
                              className={
                                stock <= 0
                                  ? 'text-destructive'
                                  : stock <= 5
                                    ? 'text-amber-700'
                                    : 'text-foreground'
                              }
                            >
                              {stock}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`${STATUS_STYLES[product.status]} hover:${STATUS_STYLES[product.status]}`}
                          >
                            {STATUS_LABEL[product.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleFeaturedToggle(product.id, !product.is_featured)}
                            disabled={actionLoading === product.id}
                            aria-label={product.is_featured ? 'Unfeature' : 'Feature'}
                            className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                product.is_featured ? 'fill-primary text-primary' : ''
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {product.status === 'active' && (
                              <Link href={`/products/${product.slug}`} target="_blank">
                                <Button variant="ghost" size="icon" aria-label="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Link href={`/admin/products/${product.id}`}>
                              <Button variant="ghost" size="icon" aria-label="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Duplicate"
                              onClick={() => handleDuplicate(product)}
                              disabled={actionLoading === product.id}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {product.status !== 'active' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Publish"
                                onClick={() => handleStatusChange(product.id, 'active')}
                                disabled={actionLoading === product.id}
                                className="text-emerald-600"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Move to draft"
                                onClick={() => handleStatusChange(product.id, 'draft')}
                                disabled={actionLoading === product.id}
                                className="text-amber-700"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => handleDelete(product.id)}
                              disabled={actionLoading === product.id}
                              className="text-destructive hover:text-destructive"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}