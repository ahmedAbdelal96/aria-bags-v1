'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { Product, Category } from '@/lib/types';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Archive,
  FileText,
  Star,
  Download,
  MoreHorizontal,
  ExternalLink,
  Copy,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'true' | 'false'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (categoryFilter !== 'all') {
      query = query.eq('category_id', categoryFilter);
    }

    if (featuredFilter !== 'all') {
      query = query.eq('is_featured', featuredFilter === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  }, [statusFilter, categoryFilter, featuredFilter, search]);

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive' | 'archived') => {
    setActionLoading(id);
    const supabase = createClient();
    const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id);

    if (!error) {
      setProducts(products.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    }
    setActionLoading(null);
  };

  const handleFeaturedToggle = async (id: string, featured: boolean) => {
    setActionLoading(id);
    const supabase = createClient();
    const { error } = await supabase.from('products').update({ is_featured: featured }).eq('id', id);

    if (!error) {
      setProducts(products.map((p) => (p.id === id ? { ...p, is_featured: featured } : p)));
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;

    setActionLoading(id);
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
    } else {
      alert('Failed to delete product');
    }
    setActionLoading(null);
  };

  const handleDuplicate = async (product: Product) => {
    setActionLoading(product.id);
    const supabase = createClient();

    const { error } = await supabase.from('products').insert([
      {
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        category_id: product.category_id,
        image_url: product.image_url,
        file_url: product.file_url,
        file_size: product.file_size,
        file_type: product.file_type,
        status: 'inactive',
        is_featured: false,
        is_instant_download: product.is_instant_download,
      },
    ]);

    if (!error) {
      fetchProducts();
    } else {
      alert('Failed to duplicate product');
    }
    setActionLoading(null);
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || 'Uncategorized';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your digital products</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
              <option value="all">All Status</option>
              <option value="active">Published</option>
              <option value="inactive">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as 'all' | 'true' | 'false')}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Products</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
          <CardDescription>
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No products found</p>
              <Link href="/admin/products/new">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Featured</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
                              <Package className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{getCategoryName(product.category_id)}</td>
                      <td className="px-4 py-3 text-sm font-medium">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3">{getStatusBadge(product.status)}</td>
                      <td className="px-4 py-3">
                        {product.is_featured ? (
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <button
                            onClick={() => handleFeaturedToggle(product.id, true)}
                            disabled={actionLoading === product.id}
                            className="text-muted-foreground hover:text-yellow-500"
                          >
                            <Star className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.file_type ? (
                          <Badge variant="outline">{product.file_type}</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {product.status === 'active' && (
                            <Link href={`/products/${product.slug}`} target="_blank">
                              <Button variant="ghost" size="sm" title="View on store">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}

                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(product)}
                            disabled={actionLoading === product.id}
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>

                          {product.status !== 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(product.id, 'active')}
                              disabled={actionLoading === product.id}
                              title="Publish"
                              className="text-green-600"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}

                          {product.status !== 'inactive' && product.status !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(product.id, 'inactive')}
                              disabled={actionLoading === product.id}
                              title="Move to Draft"
                              className="text-yellow-600"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}

                          {product.status !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(product.id, 'archived')}
                              disabled={actionLoading === product.id}
                              title="Archive"
                              className="text-gray-600"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            disabled={actionLoading === product.id}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
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
  );
}
