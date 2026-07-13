'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
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
  Trash2,
  Send,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/aria/empty-state'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, getTotalStock, normalizeProduct } from '@/lib/product'
import type { Product, Category } from '@/lib/types'
import { AdminPageHeader, AdminStatusBadge } from '@/components/admin/admin-components'

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
    categories.find((c) => c.id === categoryId)?.name ?? '-'

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

  const handleArchive = async (id: string) => {
    setActionLoading(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ status: 'archived' }).eq('id', id)
    if (!error) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'archived' } : p)))
    } else {
      alert('Failed to archive product.')
    }
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently? This cannot be undone.')) return
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
    <div className="space-y-6 font-sans">
      <AdminPageHeader
        title="Products"
        description="Manage your ARIA pieces and inventory items."
      >
        <Button
          asChild
          className="h-10 rounded-lg bg-admin-primary px-4 text-xs font-semibold text-white hover:bg-admin-primary-hover border-0 shadow-sm cursor-pointer transition-colors"
        >
          <Link href="/admin/products/new" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            New product
          </Link>
        </Button>
      </AdminPageHeader>

      {/* Filters */}
      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
        <CardHeader className="pb-4 border-b border-admin-border/60">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-admin-text">
            <Filter className="h-4 w-4 text-admin-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-muted-text" />
              <Input
                placeholder="Search by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 border-admin-border bg-admin-card rounded-lg"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary"
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
              className="rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary"
            >
              <option value="all">All pieces</option>
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
        <CardHeader className="pb-3 border-b border-admin-border/60">
          <CardTitle className="font-sans text-base font-bold text-admin-text">All products ({products.length})</CardTitle>
          <CardDescription className="text-xs text-admin-muted-text">
            {products.length} {products.length === 1 ? 'piece' : 'pieces'} found
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
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
            <div className="overflow-x-auto rounded-lg border border-admin-border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-admin-soft border-b border-admin-border">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-admin-muted-text">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {products.map((product) => {
                    const stock = getTotalStock(product)
                    return (
                      <tr key={product.id} className="hover:bg-admin-soft/40 transition-colors">
                        <td className="px-4 py-3.5 text-sm text-admin-text">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-admin-soft border border-admin-border/50">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-admin-muted-text">
                                  <Package className="h-4 w-4" strokeWidth={1.5} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-admin-text truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-admin-muted-text font-mono truncate max-w-[200px]">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-muted-text">
                          {getCategoryName(product.category_id)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-text">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold">{formatPrice(product.sale_price ?? product.price)}</span>
                            {product.sale_price != null && product.sale_price > 0 ? (
                              <span className="text-xs text-admin-muted-text line-through font-medium">
                                {formatPrice(product.price)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-text">
                          {product.colors.length === 0 ? (
                            <span className="text-admin-muted-text">-</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span
                                className={
                                  stock <= 0
                                    ? 'text-red-600 font-bold'
                                    : stock <= 5
                                      ? 'text-amber-600 font-semibold'
                                      : 'text-admin-text font-medium'
                                }
                              >
                                {stock}
                              </span>
                              {stock <= 5 ? (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200 w-fit">
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                  Low stock
                                </span>
                              ) : null}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <AdminStatusBadge status={product.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleFeaturedToggle(product.id, !product.is_featured)}
                            disabled={actionLoading === product.id}
                            aria-label={product.is_featured ? 'Unfeature' : 'Feature'}
                            className="text-admin-muted-text hover:text-admin-primary transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                product.is_featured ? 'fill-admin-accent text-admin-accent' : ''
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm">
                          <div className="flex items-center justify-end gap-1">
                            {product.status === 'active' && (
                              <Link href={`/products/${product.slug}`} target="_blank">
                                <Button variant="ghost" size="icon" aria-label="View in store" title="View in store" className="h-8 w-8 hover:bg-admin-soft text-admin-muted-text hover:text-admin-primary rounded-md cursor-pointer">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Link href={`/admin/products/${product.id}`}>
                              <Button variant="ghost" size="icon" aria-label="Edit product" title="Edit product" className="h-8 w-8 hover:bg-admin-soft text-admin-muted-text hover:text-admin-primary rounded-md cursor-pointer">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Duplicate"
                              title="Duplicate product"
                              onClick={() => handleDuplicate(product)}
                              disabled={actionLoading === product.id}
                              className="h-8 w-8 hover:bg-admin-soft text-admin-muted-text hover:text-admin-primary rounded-md cursor-pointer"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {product.status !== 'active' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Publish"
                                title="Publish product (set active)"
                                onClick={() => handleStatusChange(product.id, 'active')}
                                disabled={actionLoading === product.id}
                                className="h-8 w-8 hover:bg-emerald-50 text-emerald-600 rounded-md cursor-pointer"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Move to draft"
                                title="Move to draft"
                                onClick={() => handleStatusChange(product.id, 'draft')}
                                disabled={actionLoading === product.id}
                                className="h-8 w-8 hover:bg-amber-50 text-amber-700 rounded-md cursor-pointer"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                            {product.status === 'archived' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete permanently"
                                title="Delete permanently from database"
                                onClick={() => handleDelete(product.id)}
                                disabled={actionLoading === product.id}
                                className="h-8 w-8 hover:bg-rose-50 text-red-600 rounded-md cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Archive product"
                                title="Archive product (removes from store)"
                                onClick={() => handleArchive(product.id)}
                                disabled={actionLoading === product.id}
                                className="h-8 w-8 hover:bg-zinc-100 text-admin-muted-text hover:text-admin-primary rounded-md cursor-pointer"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
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
