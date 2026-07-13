'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/aria/empty-state'
import { createClient } from '@/lib/supabase/client'
import { Edit, FolderTree, Loader2, Package, Trash2, Plus } from 'lucide-react'
import type { Category, Product } from '@/lib/types'
import { AdminPageHeader } from '@/components/admin/admin-components'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
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
      setIsAdding(false)
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
    setIsAdding(false)
    setFormData({ name: '', slug: '', description: '' })
  }

  const showForm = isAdding || editingId !== null

  return (
    <div className="space-y-6 font-sans">
      <AdminPageHeader
        title="Collections"
        description="Group your products into collections."
      >
        {!showForm && (
          <Button
            onClick={() => setIsAdding(true)}
            className="h-10 rounded-lg bg-admin-primary px-4 text-xs font-semibold text-white hover:bg-admin-primary-hover border-0 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add collection
          </Button>
        )}
      </AdminPageHeader>

      {showForm && (
        <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl mb-6">
          <CardHeader className="pb-3 border-b border-admin-border/60">
            <CardTitle className="font-sans text-base font-bold text-admin-text">
              {editingId ? 'Edit collection' : 'Add collection'}
            </CardTitle>
            <CardDescription className="text-xs text-admin-muted-text">
              {editingId ? 'Update the collection details.' : 'Create a new product collection.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Tote Bags"
                    required
                    className="h-10 border-admin-border bg-admin-card rounded-lg"
                  />
                </Field>
                <Field label="Slug">
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="tote-bags"
                    required
                    className="h-10 border-admin-border bg-admin-card rounded-lg"
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="A short description shown on the storefront."
                  rows={2}
                  className="w-full rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary"
                />
              </Field>

              {error ? (
                <p className="text-xs font-semibold text-red-600">{error}</p>
              ) : null}

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-admin-primary px-4 text-xs font-semibold text-white hover:bg-admin-primary-hover border-0 shadow-sm cursor-pointer transition-colors"
                >
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
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
                    className="h-10 rounded-lg border border-admin-border bg-admin-card px-4 text-xs font-semibold hover:bg-admin-soft text-admin-text cursor-pointer transition-colors"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
        <CardHeader className="pb-3 border-b border-admin-border/60">
          <CardTitle className="font-sans text-base font-bold text-admin-text">All collections ({categories.length})</CardTitle>
          <CardDescription className="text-xs text-admin-muted-text">Manage your product groupings.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={FolderTree}
              title="No collections yet"
              description="Create your first collection using the form above."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-150 ${
                    editingId === cat.id
                      ? 'border-admin-primary bg-admin-soft shadow-sm'
                      : 'border-admin-border hover:border-admin-primary/45 bg-admin-card'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-soft text-admin-primary border border-admin-border flex-shrink-0">
                      <FolderTree className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-admin-text truncate">{cat.name}</p>
                      <p className="text-xs text-admin-muted-text font-mono truncate">{cat.slug}</p>
                      {cat.description && (
                        <p className="mt-1 text-xs text-admin-muted-text line-clamp-1 leading-normal">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3 border-l border-admin-border/65 pl-3">
                    <span className="hidden items-center gap-1 text-xs font-semibold text-admin-muted-text sm:inline-flex bg-admin-soft border border-admin-border rounded px-1.5 py-0.5">
                      <Package className="h-3 w-3 text-admin-primary" />
                      {getProductCount(cat.id)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} aria-label="Edit" title="Edit collection" className="h-8 w-8 hover:bg-admin-soft text-admin-muted-text hover:text-admin-primary rounded-md cursor-pointer">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cat.id)}
                      aria-label="Delete"
                      title="Delete collection"
                      className="h-8 w-8 hover:bg-rose-50 text-red-600 rounded-md cursor-pointer"
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
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-semibold text-admin-text">{label}</label>
      {children}
    </div>
  )
}