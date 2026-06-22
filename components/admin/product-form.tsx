'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ColorSwatch } from '@/components/aria/color-swatch'
import { ProductImageUpload } from '@/components/admin/product-image-upload'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductColor, Category } from '@/lib/types'

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

interface FormState {
  name: string
  slug: string
  short_description: string
  description: string
  price: number
  sale_price: number | null
  category_id: string
  image_url: string
  images: string[]
  colors: ProductColor[]
  material: string
  dimensions: string
  care_instructions: string
  status: Product['status']
  is_featured: boolean
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    short_description: product?.short_description ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    sale_price: product?.sale_price ?? null,
    category_id: product?.category_id ?? categories[0]?.id ?? '',
    image_url: product?.image_url ?? '',
    images: product?.images ?? [],
    colors: product?.colors ?? [],
    material: product?.material ?? '',
    dimensions: product?.dimensions ?? '',
    care_instructions: product?.care_instructions ?? '',
    status: product?.status ?? 'active',
    is_featured: product?.is_featured ?? false,
  })

  // Color form (inline)
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#1A1B15')
  const [newColorStock, setNewColorStock] = useState(1)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      // Only auto-update slug for new products
      slug: product ? prev.slug : generateSlug(value),
    }))
  }

  const handleCoverChange = (url: string) => {
    setForm((prev) => ({
      ...prev,
      image_url: url,
      images: prev.images.length === 0 ? [url] : prev.images,
    }))
  }

  const handleAddColor = () => {
    if (!newColorName.trim()) return
    setForm((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          name: newColorName.trim(),
          hex: newColorHex,
          stock: Math.max(0, Number(newColorStock) || 0),
        },
      ],
    }))
    setNewColorName('')
    setNewColorStock(1)
  }

  const handleRemoveColor = (index: number) => {
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }))
  }

  const handleColorChange = (index: number, patch: Partial<ProductColor>) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.name.trim()) {
      setError('Product name is required.')
      setLoading(false)
      return
    }
    if (!form.slug.trim()) {
      setError('Slug is required.')
      setLoading(false)
      return
    }
    if (!form.category_id) {
      setError('Please choose a category.')
      setLoading(false)
      return
    }
    if (form.price <= 0) {
      setError('Price must be greater than 0.')
      setLoading(false)
      return
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      price: form.price,
      sale_price: form.sale_price,
      category_id: form.category_id,
      image_url: form.image_url || null,
      images: form.images,
      colors: form.colors,
      material: form.material.trim() || null,
      dimensions: form.dimensions.trim() || null,
      care_instructions: form.care_instructions.trim() || null,
      status: form.status,
      is_featured: form.is_featured,
    }

    try {
      const supabase = createClient()
      if (product?.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      console.error('Error saving product:', err)
      setError(err instanceof Error ? err.message : 'Failed to save product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Basic information</CardTitle>
          <CardDescription>Name, category, and copy shown to customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Product name" required>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Onyx Classic Tote"
              required
            />
          </Field>
          <Field label="Slug" required hint="URL-friendly identifier">
            <Input
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              placeholder="onyx-classic-tote"
              required
            />
          </Field>
          <Field label="Short description">
            <Textarea
              value={form.short_description}
              onChange={(e) => update('short_description', e.target.value)}
              placeholder="One line shown on product cards"
              rows={2}
            />
          </Field>
          <Field label="Full description">
            <Textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Tell the story of this piece"
              rows={5}
            />
          </Field>
          <Field label="Category" required>
            <select
              value={form.category_id}
              onChange={(e) => update('category_id', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (USD)" required>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => update('price', Number(e.target.value))}
              placeholder="0.00"
              step="0.01"
              min={0}
              required
            />
          </Field>
          <Field label="Sale price (USD)" hint="Optional">
            <Input
              type="number"
              value={form.sale_price ?? ''}
              onChange={(e) =>
                update('sale_price', e.target.value === '' ? null : Number(e.target.value))
              }
              placeholder="0.00"
              step="0.01"
              min={0}
            />
          </Field>
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Imagery</CardTitle>
          <CardDescription>First uploaded image is used as the cover.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductImageUpload value={form.image_url} onChange={handleCoverChange} />
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Colours & stock</CardTitle>
          <CardDescription>Each colour represents a variant of this piece.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {form.colors.length === 0 ? (
            <p className="rounded-md border border-dashed border-primary/20 bg-background/40 px-4 py-6 text-center text-sm text-muted-foreground">
              No colours yet. Add at least one colour to track stock.
            </p>
          ) : (
            <div className="space-y-3">
              {form.colors.map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  className="grid grid-cols-[44px_1fr_120px_auto] items-center gap-3 rounded-md border border-primary/15 bg-background/40 p-3"
                >
                  <ColorSwatch name={c.name} value={c.hex} size="md" />
                  <div>
                    <Input
                      value={c.name}
                      onChange={(e) => handleColorChange(i, { name: e.target.value })}
                      placeholder="Colour name"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => handleColorChange(i, { hex: e.target.value })}
                      className="h-9 w-9 cursor-pointer rounded border border-input bg-transparent"
                      aria-label="Colour hex"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={c.stock}
                      onChange={(e) => handleColorChange(i, { stock: Number(e.target.value) })}
                      placeholder="Stock"
                      className="w-20"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${c.name}`}
                    onClick={() => handleRemoveColor(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 rounded-md border border-primary/15 bg-background/40 p-3 sm:grid-cols-[1fr_120px_120px_auto]">
            <Input
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Colour name (e.g. Onyx Black)"
            />
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="h-10 w-full cursor-pointer rounded border border-input bg-transparent"
              aria-label="New colour hex"
            />
            <Input
              type="number"
              min={0}
              value={newColorStock}
              onChange={(e) => setNewColorStock(Number(e.target.value))}
              placeholder="Stock"
            />
            <Button type="button" onClick={handleAddColor} variant="outline" className="border-primary/40">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Craft details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Material">
            <Input
              value={form.material}
              onChange={(e) => update('material', e.target.value)}
              placeholder="Full-grain Italian leather"
            />
          </Field>
          <Field label="Dimensions">
            <Input
              value={form.dimensions}
              onChange={(e) => update('dimensions', e.target.value)}
              placeholder="38 × 30 × 14 cm"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Care instructions">
              <Textarea
                value={form.care_instructions}
                onChange={(e) => update('care_instructions', e.target.value)}
                placeholder="Store in dust bag. Avoid prolonged direct sunlight."
                rows={3}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-card/60">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Status & visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value as Product['status'])}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Field>

          <div className="flex items-center justify-between rounded-md border border-primary/15 bg-background/40 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Featured on homepage</p>
              <p className="text-xs text-muted-foreground">Highlight in the Featured section.</p>
            </div>
            <Switch
              checked={form.is_featured}
              onCheckedChange={(checked) => update('is_featured', checked)}
              aria-label="Toggle featured"
            />
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 uppercase tracking-[0.22em] text-xs"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {product ? 'Save changes' : 'Create product'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-12 rounded-none border-primary/40 px-8 uppercase tracking-[0.22em] text-xs"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.22em] text-foreground/80">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
        {hint ? <span className="ml-2 normal-case tracking-normal text-muted-foreground">({hint})</span> : null}
      </label>
      {children}
    </div>
  )
}