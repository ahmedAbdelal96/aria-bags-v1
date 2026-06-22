'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { Category, Product } from '@/lib/types';
import { FolderTree, Plus, Edit, Trash2, Package, Check, X } from 'lucide-react';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const [categoriesResult, productsResult] = await Promise.all([
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('products').select('category_id'),
      ]);

      if (!categoriesResult.error && categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (!productsResult.error && productsResult.data) {
        setProducts(productsResult.data);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const getProductCount = (categoryId: string) => {
    return products.filter((p) => p.category_id === categoryId).length;
  };

  const handleNameChange = (name: string) => {
    if (!editingId) {
      setFormData({ ...formData, name, slug: generateSlug(name) });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    setSaving(true);
    const supabase = createClient();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        setCategories(categories.map((c) => (c.id === editingId ? { ...c, ...formData } : c)));
        setEditingId(null);
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ ...formData, display_order: categories.length }])
          .select()
          .single();

        if (error) throw error;
        setCategories([...categories, data]);
      }

      setFormData({ name: '', slug: '', description: '' });
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const productCount = getProductCount(id);
    if (productCount > 0) {
      alert(`Cannot delete this category. It has ${productCount} product(s). Remove or reassign products first.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      alert('Failed to delete category');
    } else {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Manage product categories</p>
      </div>

      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Category' : 'Add Category'}</CardTitle>
          <CardDescription>
            {editingId ? 'Update category details' : 'Create a new product category'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium block mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Category name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-slug"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
          <CardDescription>Manage your product categories</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 py-12 text-center">
              <FolderTree className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No categories yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first category using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    editingId === category.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <FolderTree className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{category.name}</h4>
                        {editingId === category.id && (
                          <Badge variant="outline" className="text-xs">
                            Editing
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{category.slug}</p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{getProductCount(category.id)} products</span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        disabled={editingId === category.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
