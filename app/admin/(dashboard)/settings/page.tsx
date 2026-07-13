'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Check, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { AdminPageHeader } from '@/components/admin/admin-components'

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
  hero_title: 'Quiet luxury, crafted to last.',
  hero_subtitle:
    'Discover handbags designed for the modern woman with sculpted silhouettes, full-grain leather, and the ARIA signature in every stitch.',
  hero_cta_label: 'Shop collections',
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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminPageHeader
        title="Store settings"
        description="Configure homepage copy and storefront call-to-actions."
      >
        <Button
          type="submit"
          form="settings-form"
          disabled={saving}
          className="h-10 rounded-lg bg-admin-primary px-4 text-xs font-semibold text-white hover:bg-admin-primary-hover border-0 shadow-sm cursor-pointer transition-colors"
        >
          {saving ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              Save settings
            </span>
          )}
        </Button>
      </AdminPageHeader>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-admin-border/60">
            <CardTitle className="font-sans text-base font-bold text-admin-text">Hero section</CardTitle>
            <CardDescription className="text-xs text-admin-muted-text">The main banner shown on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Field label="Hero title">
              <Input
                value={settings.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                placeholder="Quiet luxury, crafted to last."
                className="h-10 border-admin-border bg-admin-card rounded-lg"
              />
            </Field>
            <Field label="Hero subtitle">
              <textarea
                value={settings.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                placeholder="Short description..."
                rows={3}
                className="w-full rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CTA label">
                <Input
                  value={settings.hero_cta_label}
                  onChange={(e) => handleChange('hero_cta_label', e.target.value)}
                  placeholder="Shop collections"
                  className="h-10 border-admin-border bg-admin-card rounded-lg"
                />
              </Field>
              <Field label="CTA URL">
                <Input
                  value={settings.hero_cta_url}
                  onChange={(e) => handleChange('hero_cta_url', e.target.value)}
                  placeholder="/#new-arrivals"
                  className="h-10 border-admin-border bg-admin-card rounded-lg"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-admin-border/60">
            <CardTitle className="font-sans text-base font-bold text-admin-text">Featured section</CardTitle>
            <CardDescription className="text-xs text-admin-muted-text">Title of the featured products area.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Field label="Section title">
              <Input
                value={settings.featured_section_title}
                onChange={(e) => handleChange('featured_section_title', e.target.value)}
                placeholder="House favourites"
                className="h-10 border-admin-border bg-admin-card rounded-lg"
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-admin-border/60">
            <CardTitle className="font-sans text-base font-bold text-admin-text">Promo banner</CardTitle>
            <CardDescription className="text-xs text-admin-muted-text">Small banner shown beneath benefits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <label className="flex items-center gap-2.5 text-sm text-admin-text font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={settings.promo_enabled}
                onChange={(e) => handleChange('promo_enabled', e.target.checked)}
                className="rounded border-admin-border text-admin-primary focus:ring-admin-primary h-4 w-4"
              />
              <span>Enable promo section</span>
            </label>
            {settings.promo_enabled && (
              <div className="space-y-4 pt-2 border-t border-admin-border/40">
                <Field label="Promo title">
                  <Input
                    value={settings.promo_title}
                    onChange={(e) => handleChange('promo_title', e.target.value)}
                    className="h-10 border-admin-border bg-admin-card rounded-lg"
                  />
                </Field>
                <Field label="Promo description">
                  <textarea
                    value={settings.promo_description}
                    onChange={(e) => handleChange('promo_description', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-1 focus:ring-admin-primary"
                  />
                </Field>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-admin-border/60">
            <CardTitle className="font-sans text-base font-bold text-admin-text">Final CTA</CardTitle>
            <CardDescription className="text-xs text-admin-muted-text">Closing call-to-action on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Field label="Title">
              <Input
                value={settings.cta_title}
                onChange={(e) => handleChange('cta_title', e.target.value)}
                className="h-10 border-admin-border bg-admin-card rounded-lg"
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={settings.cta_subtitle}
                onChange={(e) => handleChange('cta_subtitle', e.target.value)}
                className="h-10 border-admin-border bg-admin-card rounded-lg"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label">
                <Input
                  value={settings.cta_button_label}
                  onChange={(e) => handleChange('cta_button_label', e.target.value)}
                  className="h-10 border-admin-border bg-admin-card rounded-lg"
                />
              </Field>
              <Field label="Button URL">
                <Input
                  value={settings.cta_button_url}
                  onChange={(e) => handleChange('cta_button_url', e.target.value)}
                  className="h-10 border-admin-border bg-admin-card rounded-lg"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="h-10 rounded-lg bg-admin-primary px-5 text-xs font-semibold text-white hover:bg-admin-primary-hover border-0 shadow-sm cursor-pointer transition-colors"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving settings...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                Save settings
              </span>
            )}
          </Button>
          {success && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="h-4 w-4" />
              Saved successfully
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
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
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-semibold text-admin-text">{label}</label>
      {children}
    </div>
  )
}
