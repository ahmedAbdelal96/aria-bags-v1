'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Check, AlertCircle, Settings, Save } from 'lucide-react';

interface StoreSettings {
  id?: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_label: string;
  hero_cta_url: string;
  promo_title: string;
  promo_description: string;
  promo_enabled: boolean;
  featured_section_title: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_label: string;
  cta_button_url: string;
}

const defaultSettings: StoreSettings = {
  hero_title: 'Premium Digital Products, Delivered Instantly',
  hero_subtitle:
    "Browse thousands of digital resources, templates, guides, and downloadable products. Get instant access after purchase.",
  hero_cta_label: 'Browse Products',
  hero_cta_url: '/#featured',
  promo_title: 'Ready to Get Started?',
  promo_description: "Browse our collection of premium digital products and find exactly what you need.",
  promo_enabled: true,
  featured_section_title: 'Featured Products',
  cta_title: 'Ready to Get Started?',
  cta_subtitle: 'Browse our collection of premium digital products.',
  cta_button_label: 'Explore Products',
  cta_button_url: '/',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();

      const { data, error } = await supabase.from('store_settings').select('*').limit(1);

      if (!error && data && data.length > 0) {
        setSettings({ ...defaultSettings, ...data[0] });
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleChange = (field: keyof StoreSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    try {
      const { data: existing } = await supabase.from('store_settings').select('id').limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('store_settings')
          .update(settings)
          .eq('id', existing[0].id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('store_settings').insert([settings]);

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Configure your store content</p>
      </div>

      {/* Migration Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Setup Required</p>
              <p className="text-sm text-blue-800">
                If this is your first time, run the migration SQL in Supabase SQL Editor first:
                <code className="ml-2 bg-blue-100 px-2 py-0.5 rounded">
                  supabase/migrations/001_add_store_settings.sql
                </code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* Hero Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>The main banner on your homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Hero Title</label>
              <Input
                value={settings.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                placeholder="Premium Digital Products"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Hero Subtitle</label>
              <textarea
                value={settings.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                placeholder="Your subtitle..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium block mb-2">CTA Button Label</label>
                <Input
                  value={settings.hero_cta_label}
                  onChange={(e) => handleChange('hero_cta_label', e.target.value)}
                  placeholder="Browse Products"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">CTA Button URL</label>
                <Input
                  value={settings.hero_cta_url}
                  onChange={(e) => handleChange('hero_cta_url', e.target.value)}
                  placeholder="/#featured"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promo Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Promo Banner</CardTitle>
            <CardDescription>The promotional section below benefits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="promo_enabled"
                checked={settings.promo_enabled}
                onChange={(e) => handleChange('promo_enabled', e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="promo_enabled" className="text-sm font-medium">
                Enable Promo Section
              </label>
            </div>

            {settings.promo_enabled && (
              <>
                <div>
                  <label className="text-sm font-medium block mb-2">Promo Title</label>
                  <Input
                    value={settings.promo_title}
                    onChange={(e) => handleChange('promo_title', e.target.value)}
                    placeholder="Ready to Get Started?"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Promo Description</label>
                  <textarea
                    value={settings.promo_description}
                    onChange={(e) => handleChange('promo_description', e.target.value)}
                    placeholder="Your description..."
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Featured Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Featured Products Section</CardTitle>
            <CardDescription>Configure the featured products area</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium block mb-2">Section Title</label>
              <Input
                value={settings.featured_section_title}
                onChange={(e) => handleChange('featured_section_title', e.target.value)}
                placeholder="Featured Products"
              />
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Call to Action Section</CardTitle>
            <CardDescription>The final CTA section on homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">CTA Title</label>
              <Input
                value={settings.cta_title}
                onChange={(e) => handleChange('cta_title', e.target.value)}
                placeholder="Ready to Get Started?"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">CTA Subtitle</label>
              <Input
                value={settings.cta_subtitle}
                onChange={(e) => handleChange('cta_subtitle', e.target.value)}
                placeholder="Browse our collection..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium block mb-2">Button Label</label>
                <Input
                  value={settings.cta_button_label}
                  onChange={(e) => handleChange('cta_button_label', e.target.value)}
                  placeholder="Explore Products"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Button URL</label>
                <Input
                  value={settings.cta_button_url}
                  onChange={(e) => handleChange('cta_button_url', e.target.value)}
                  placeholder="/"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>

          {success && (
            <span className="flex items-center text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              Settings saved successfully!
            </span>
          )}

          {error && (
            <span className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
