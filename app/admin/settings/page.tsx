'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Check, Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StoreSettings {
  id?: string
  hero_title: string
  hero_subtitle: string
  hero_cta_label: string
  hero_cta_url: string
  promo_title: string
  promo_description: string
  promo_enabled: boolean
  featured_section_title: string
  cta_title: string
  cta_subtitle: string
  cta_button_label: string
  cta_button_url: string
}

const defaultSettings: StoreSettings = {
  hero_title: 'Quiet luxury. Crafted to last.',
  hero_subtitle:
    'Discover handbags designed for the modern woman — sculpted silhouettes, full-grain leather, and the ARIA signature in every stitch.',
  hero_cta_label: 'Shop the collection',
  hero_cta_url: '/#new-arrivals',
  promo_title: 'Complimentary shipping',
  promo_description: 'Free insured delivery on every ARIA order across the region.',
  promo_enabled: true,
  featured_section_title: 'House favourites',
  cta_title: 'Become an ARIA insider',
  cta_subtitle: 'Be the first to know about new collections and private events.',
  cta_button_label: 'Join the list',
  cta_button_url: '/',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSettings({ ...defaultSettings, ...data[0] })
        }
        setLoading(false)
      })
  }, [])

  const handleChange = (field: keyof StoreSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    try {
      const { data: existing } = await supabase.from('store_settings').select('id').limit(1)
      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('store_settings')
          .update(settings)
          .eq('id', existing[0].id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('store_settings').insert([settings])
        if (error) throw error
      }
      setSuccess(true)
      window.setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Admin</span>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Store settings</h1>
        <p className="text-sm text-muted-foreground">Configure homepage copy and CTAs.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-primary/15 bg-card/60">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Hero section</CardTitle>
            <CardDescription>The main banner shown on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Hero title">
              <Input
                value={settings.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                placeholder="Quiet luxury."
              />
            </Field>
            <Field label="Hero subtitle">
              <textarea
                value={settings.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                placeholder="Short description..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="CTA label">
                <Input
                  value={settings.hero_cta_label}
                  onChange={(e) => handleChange('hero_cta_label', e.target.value)}
                  placeholder="Shop the collection"
                />
              </Field>
              <Field label="CTA URL">
                <Input
                  value={settings.hero_cta_url}
                  onChange={(e) => handleChange('hero_cta_url', e.target.value)}
                  placeholder="/#new-arrivals"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-card/60">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Featured section</CardTitle>
            <CardDescription>Title of the featured products area.</CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="Section title">
              <Input
                value={settings.featured_section_title}
                onChange={(e) => handleChange('featured_section_title', e.target.value)}
                placeholder="House favourites"
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-card/60">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Promo banner</CardTitle>
            <CardDescription>Small banner shown beneath benefits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.promo_enabled}
                onChange={(e) => handleChange('promo_enabled', e.target.checked)}
                className="rounded border-input"
              />
              <span>Enable promo section</span>
            </label>
            {settings.promo_enabled && (
              <>
                <Field label="Promo title">
                  <Input
                    value={settings.promo_title}
                    onChange={(e) => handleChange('promo_title', e.target.value)}
                  />
                </Field>
                <Field label="Promo description">
                  <textarea
                    value={settings.promo_description}
                    onChange={(e) => handleChange('promo_description', e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </Field>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-card/60">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Final CTA</CardTitle>
            <CardDescription>Closing call-to-action on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title">
              <Input
                value={settings.cta_title}
                onChange={(e) => handleChange('cta_title', e.target.value)}
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={settings.cta_subtitle}
                onChange={(e) => handleChange('cta_subtitle', e.target.value)}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Button label">
                <Input
                  value={settings.cta_button_label}
                  onChange={(e) => handleChange('cta_button_label', e.target.value)}
                />
              </Field>
              <Field label="Button URL">
                <Input
                  value={settings.cta_button_url}
                  onChange={(e) => handleChange('cta_button_url', e.target.value)}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
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
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save settings
              </>
            )}
          </Button>
          {success && (
            <span className="flex items-center gap-1 text-xs text-emerald-700">
              <Check className="h-4 w-4" />
              Saved successfully
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
          )}
        </div>
      </form>
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