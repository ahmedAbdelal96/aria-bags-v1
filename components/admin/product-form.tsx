'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save, Trash2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [success, setSuccess] = useState(false)
  const [slugAuto, setSlugAuto] = useState(!product?.slug)

  // Collapsible sections state
  const [sections, setSections] = useState({
    basicInfo: true, // open by default
    images: false,
    colorsStock: false,
    optionalDetails: false,
    advanced: false,
  })

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

  // Color add panel states
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#1A1B15')
  const [newColorStock, setNewColorStock] = useState(1)
  const [colorError, setColorError] = useState<string | null>(null)

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugAuto ? generateSlug(value) : prev.slug,
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugAuto(false)
    update('slug', value)
  }

  const handleCoverChange = (url: string) => {
    setForm((prev) => ({
      ...prev,
      image_url: url,
      images: prev.images.length === 0 ? [url] : prev.images,
    }))
  }

  const handleAddColor = () => {
    setColorError(null)
    if (!newColorName.trim()) {
      setColorError('Color name is required.')
      return
    }
    const stock = Number(newColorStock)
    if (isNaN(stock) || stock < 0) {
      setColorError('Stock quantity cannot be negative.')
      return
    }
    if (form.colors.some(c => c.name.toLowerCase() === newColorName.trim().toLowerCase())) {
      setColorError('A color variant with this name already exists.')
      return
    }
    
    setForm((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          name: newColorName.trim(),
          hex: newColorHex,
          stock,
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
      colors: prev.colors.map((color, i) => (i === index ? { ...color, ...patch } : color)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!form.name.trim()) {
      setError('Product name is required.')
      setSections(s => ({ ...s, basicInfo: true }))
      setLoading(false)
      return
    }
    if (!form.category_id) {
      setError('Please choose a category.')
      setSections(s => ({ ...s, basicInfo: true }))
      setLoading(false)
      return
    }
    if (form.price <= 0) {
      setError('Price must be greater than 0.')
      setSections(s => ({ ...s, basicInfo: true }))
      setLoading(false)
      return
    }
    if (!form.image_url.trim()) {
      setError('Please upload a cover image.')
      setSections(s => ({ ...s, images: true }))
      setLoading(false)
      return
    }
    if (form.colors.length === 0) {
      setError('Please add at least one color with stock.')
      setSections(s => ({ ...s, colorsStock: true }))
      setLoading(false)
      return
    }
    if (!form.slug.trim()) {
      setError('Slug is required.')
      setSections(s => ({ ...s, advanced: true }))
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
        setSuccess(true)
        router.refresh()
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select('id')
          .single()
        if (error) throw error
        setSuccess(true)
        console.log("[ARIA ADMIN][product.create.redirect]", {
          id: data?.id,
          target: `/admin/products/${data?.id}`
        })
        if (data?.id) {
          router.push(`/admin/products/${data.id}`)
        } else {
          router.push('/admin/products')
        }
        router.refresh()
      }
    } catch (err) {
      console.error('Error saving product:', err)
      setError(err instanceof Error ? err.message : 'Failed to save product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans max-w-4xl">
      {/* 1. Basic Info Section */}
      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader 
          className="cursor-pointer select-none hover:bg-admin-soft/40 transition-colors pb-3 border-b border-admin-border/60 flex flex-row items-center justify-between space-y-0"
          onClick={() => toggleSection('basicInfo')}
        >
          <div className="flex-1">
            <CardTitle className="font-sans text-sm font-bold text-admin-text">1. Basic info</CardTitle>
            <CardDescription className="text-[11px] text-admin-muted-text">Primary information detailing the product card representation.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-admin-muted-text">
            {sections.basicInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {sections.basicInfo && (
          <CardContent className="grid gap-4 sm:grid-cols-2 pt-4">
            <Field label="Product name" required>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Onyx Classic Tote"
                required
                className="h-10 border-admin-border bg-admin-card rounded-lg text-sm"
              />
            </Field>
            <Field label="Category / collection" required>
              <select
                value={form.category_id}
                onChange={(e) => update('category_id', e.target.value)}
                className="w-full rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary h-10"
              >
                <option value="">Select a collection</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
              <Field label="Regular Price (USD)" required>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => update('price', Number(e.target.value))}
                  placeholder="0.00"
                  step="0.01"
                  min={0}
                  required
                  className="h-10 border-admin-border bg-admin-card rounded-lg text-sm"
                />
              </Field>
              <Field label="Sale Price (USD, optional)" hint="Discount price paid at checkout">
                <Input
                  type="number"
                  value={form.sale_price ?? ''}
                  onChange={(e) =>
                    update('sale_price', e.target.value === '' ? null : Number(e.target.value))
                  }
                  placeholder="0.00"
                  step="0.01"
                  min={0}
                  className="h-10 border-admin-border bg-admin-card rounded-lg text-sm"
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Status" required>
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value as Product['status'])}
                  className="w-full rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary h-10"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Short description" hint="Optional">
                <Textarea
                  value={form.short_description}
                  onChange={(e) => update('short_description', e.target.value)}
                  placeholder="One line shown on the product card."
                  rows={2}
                  className="border-admin-border bg-admin-card rounded-lg text-sm"
                />
              </Field>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 2. Cover Image Section */}
      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader 
          className="cursor-pointer select-none hover:bg-admin-soft/40 transition-colors pb-3 border-b border-admin-border/60 flex flex-row items-center justify-between space-y-0"
          onClick={() => toggleSection('images')}
        >
          <div className="flex-1">
            <CardTitle className="font-sans text-sm font-bold text-admin-text">2. Cover image</CardTitle>
            <CardDescription className="text-[11px] text-admin-muted-text">Upload one strong cover image. It becomes the preview everywhere.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-admin-muted-text">
            {sections.images ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {sections.images && (
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-admin-text">Cover image <span className="text-red-500">*</span></label>
              <p className="text-[10px] text-admin-muted-text">This image appears on product cards and product pages.</p>
            </div>
            <ProductImageUpload value={form.image_url} onChange={handleCoverChange} />
          </CardContent>
        )}
      </Card>

      {/* 3. Colors & Stock Section */}
      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader 
          className="cursor-pointer select-none hover:bg-admin-soft/40 transition-colors pb-3 border-b border-admin-border/60 flex flex-row items-center justify-between space-y-0"
          onClick={() => toggleSection('colorsStock')}
        >
          <div className="flex-1">
            <CardTitle className="font-sans text-sm font-bold text-admin-text">3. Colors & stock</CardTitle>
            <CardDescription className="text-[11px] text-admin-muted-text">Add the colors you sell and the quantity available for each color.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-admin-muted-text">
            {sections.colorsStock ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {sections.colorsStock && (
          <CardContent className="space-y-4 pt-4">
            <p className="text-[11px] text-admin-muted-text italic">
              Add the colors you sell and the quantity available for each color.
            </p>

            {form.colors.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border bg-admin-soft px-4 py-8 text-center text-xs text-admin-muted-text">
                No colors added yet. Create at least one color and stock count below.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-admin-border bg-admin-soft">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-admin-border bg-admin-soft/80 text-[10px] font-bold text-admin-text uppercase tracking-wider">
                      <th className="p-3 w-16">Preview</th>
                      <th className="p-3">Color name</th>
                      <th className="p-3 w-28">Color hex</th>
                      <th className="p-3 w-32">Stock quantity</th>
                      <th className="p-3 w-16 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border/60">
                    {form.colors.map((color, index) => (
                      <tr key={`${color.name}-${index}`} className="bg-admin-card text-xs text-admin-text">
                        <td className="p-3">
                          <ColorSwatch name={color.name} value={color.hex} size="md" />
                        </td>
                        <td className="p-3">
                          <Input
                            value={color.name}
                            onChange={(e) => handleColorChange(index, { name: e.target.value })}
                            placeholder="Color name"
                            required
                            className="h-8 border-admin-border bg-admin-card rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={color.hex}
                              onChange={(e) => handleColorChange(index, { hex: e.target.value })}
                              className="h-8 w-8 cursor-pointer rounded border border-admin-border bg-transparent flex-shrink-0"
                              aria-label="Color hex"
                            />
                            <span className="font-mono text-[10px] text-admin-muted-text uppercase">{color.hex}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={0}
                            value={color.stock}
                            onChange={(e) => handleColorChange(index, { stock: Math.max(0, Number(e.target.value) || 0) })}
                            placeholder="Stock"
                            required
                            className="h-8 border-admin-border bg-admin-card rounded-lg text-xs w-24"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${color.name}`}
                            onClick={() => handleRemoveColor(index)}
                            className="h-8 w-8 hover:bg-rose-50 text-admin-muted-text hover:text-red-600 rounded-md cursor-pointer inline-flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add color panel */}
            <div className="rounded-xl border border-admin-border bg-admin-soft p-4 space-y-3">
              <h4 className="text-xs font-bold text-admin-text uppercase tracking-wider">Add a new color variant</h4>
              <div className="grid gap-4 sm:grid-cols-4 items-end">
                <Field label="Color name" required hint="e.g. Onyx Black">
                  <Input
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="e.g. Onyx Black"
                    className="h-9 border-admin-border bg-admin-card rounded-lg text-xs"
                  />
                </Field>
                <Field label="Color swatch picker">
                  <div className="flex items-center gap-2 h-9">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-admin-border bg-transparent flex-shrink-0"
                      aria-label="New color hex"
                    />
                    <span className="font-mono text-[10px] text-admin-muted-text uppercase">{newColorHex}</span>
                  </div>
                </Field>
                <Field label="Quantity in stock" required>
                  <Input
                    type="number"
                    min={0}
                    value={newColorStock}
                    onChange={(e) => setNewColorStock(Number(e.target.value))}
                    placeholder="Stock count"
                    className="h-9 border-admin-border bg-admin-card rounded-lg text-xs"
                  />
                </Field>
                <div>
                  <Button
                    type="button"
                    onClick={handleAddColor}
                    variant="outline"
                    className="h-9 w-full rounded-lg border-admin-primary bg-admin-card text-xs font-semibold hover:bg-admin-soft text-admin-primary cursor-pointer transition-colors px-3 flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add color
                  </Button>
                </div>
              </div>
              {colorError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  {colorError}
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 4. Optional Details Section */}
      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader 
          className="cursor-pointer select-none hover:bg-admin-soft/40 transition-colors pb-3 border-b border-admin-border/60 flex flex-row items-center justify-between space-y-0"
          onClick={() => toggleSection('optionalDetails')}
        >
          <div className="flex-1">
            <CardTitle className="font-sans text-sm font-bold text-admin-text">4. Optional details</CardTitle>
            <CardDescription className="text-[11px] text-admin-muted-text">Only fill these in when they help customers decide.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-admin-muted-text">
            {sections.optionalDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {sections.optionalDetails && (
          <CardContent className="grid gap-4 sm:grid-cols-2 pt-4">
            <Field label="Material" hint="Optional">
              <Input
                value={form.material}
                onChange={(e) => update('material', e.target.value)}
                placeholder="Full-grain Italian leather"
                className="h-10 border-admin-border bg-admin-card rounded-lg text-sm"
              />
            </Field>
            <Field label="Dimensions" hint="Optional">
              <Input
                value={form.dimensions}
                onChange={(e) => update('dimensions', e.target.value)}
                placeholder="38 x 30 x 14 cm"
                className="h-10 border-admin-border bg-admin-card rounded-lg text-sm"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Story Description" hint="Optional">
                <Textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Tell the story of this piece."
                  rows={4}
                  className="border-admin-border bg-admin-card rounded-lg text-sm"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Care instructions" hint="Optional">
                <Textarea
                  value={form.care_instructions}
                  onChange={(e) => update('care_instructions', e.target.value)}
                  placeholder="Store in dust bag. Avoid prolonged direct sunlight."
                  rows={3}
                  className="border-admin-border bg-admin-card rounded-lg text-sm"
                />
              </Field>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-admin-border bg-admin-soft p-4">
              <div>
                <p className="text-sm font-semibold text-admin-text">Featured on homepage</p>
                <p className="text-xs text-admin-muted-text">Use this for hero picks or key launches.</p>
              </div>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(checked) => update('is_featured', checked)}
                aria-label="Toggle featured"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* 5. Advanced Settings Section */}
      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl overflow-hidden">
        <CardHeader 
          className="cursor-pointer select-none hover:bg-admin-soft/40 transition-colors pb-3 border-b border-admin-border/60 flex flex-row items-center justify-between space-y-0"
          onClick={() => toggleSection('advanced')}
        >
          <div className="flex-1">
            <CardTitle className="font-sans text-sm font-bold text-admin-text">5. Advanced settings</CardTitle>
            <CardDescription className="text-[11px] text-admin-muted-text">Manage technical parameters like the URL slug.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-admin-muted-text">
            {sections.advanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardHeader>
        {sections.advanced && (
          <CardContent className="pt-4">
            <Field 
              label="Product Slug" 
              required
              hint="Used in the product URL. It is generated automatically from the product name."
            >
              <Input
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="onyx-classic-tote"
                className="h-10 border-admin-border bg-admin-card rounded-lg text-sm"
              />
            </Field>
          </CardContent>
        )}
      </Card>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : null}

      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          Product saved successfully!
        </p>
      )}

      {/* Action buttons (always visible) */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="h-10 rounded-lg bg-admin-primary px-5 text-xs font-semibold text-white hover:bg-admin-primary-hover border-0 shadow-sm cursor-pointer transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              {product ? 'Save changes' : 'Create product'}
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-10 rounded-lg border border-admin-border bg-admin-card px-5 text-xs font-semibold hover:bg-admin-soft text-admin-text cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1 inline" />
          Back
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
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-semibold text-admin-text">
        {label}
        {required ? <span className="text-red-500 font-bold"> *</span> : null}
        {hint ? <span className="ml-2 font-normal text-[10px] text-admin-muted-text">({hint})</span> : null}
      </label>
      {children}
    </div>
  )
}
