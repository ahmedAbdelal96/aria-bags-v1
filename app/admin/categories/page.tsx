'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/aria/empty-state'
import { createClient } from '@/lib/supabase/client'
import { Edit, FolderTree, Loader2, Package, Trash2 } from 'lucide-react'
import type { Category, Product } from '@/lib/types'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('categories').select('*').order('display_order', { ascending: true }),
      supabase.from('products').select('category_id'),
    ]).then(([categoriesRes, productsRes]) => {
      if (!categoriesRes.error && categoriesRes.data) setCategories(categoriesRes.data)
      if (!productsRes.error && productsRes.data) setProducts(productsRes.data as Product[])
      setLoading(false)
    })
  }, [])

  const getProductCount = (categoryId: string) =>
    products.filter((p) => p.category_id === categoryId).length

  const handleNameChange = (name: string) => {
    setFormData((prev) =>
      editingId ? { ...prev, name } : { ...prev, name, slug: generateSlug(name) },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.slug) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    try {
      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...formData } : c)),
        )
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ ...formData, display_order: categories.length }])
          .select()
          .single()
        if (error) throw error
        setCategories((prev) => [...prev, data])
      }
      setFormData({ name: '', slug: '', description: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (getProductCount(id) > 0) {
      alert('Cannot delete a collection with products. Reassign or remove products first.')
      return
    }
    if (!confirm('Delete this collection?')) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) setCategories((prev) => prev.filter((c) => c.id !== id))
    else alert('Failed to delete collection.')
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ name: '', slug: '', description: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Admin</span>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Collections</h1>
        <p className="text-sm text-muted-foreground">Group your products into collections.</p>
      </div>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">
            {editingId ? 'Edit collection' : 'Add collection'}
          </CardTitle>
          <CardDescription>
            {editingId ? 'Update the collection details.' : 'Create a new product collection.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Tote Bags"
                  required
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="tote-bags"
                  required
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="A short description shown on the storefront."
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>

            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-6 uppercase tracking-[0.22em] text-xs"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  'Update collection'
                ) : (
                  'Add collection'
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-11 rounded-none border-primary/40 px-6 uppercase tracking-[0.22em] text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">All collections ({categories.length})</CardTitle>
          <CardDescription>Manage your product groupings.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={FolderTree}
              title="No collections yet"
              description="Create your first collection using the form above."
            />
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between rounded-md border p-4 transition-colors ${
                    editingId === cat.id
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/15 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FolderTree className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.slug}</p>
                      {cat.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                      <Package className="h-3.5 w-3.5" />
                      {getProductCount(cat.id)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} aria-label="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cat.id)}
                      aria-label="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.22em] text-foreground/80">{label}</label>
      {children}
    </div>
  )
}