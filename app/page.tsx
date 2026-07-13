import Link from 'next/link'
import { ArrowRight, Award, Feather, Sparkles, ShieldCheck, Truck } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductGrid } from '@/components/aria/product-grid'
import { DebugImage } from '@/components/aria/debug-image'
import { SectionHeader } from '@/components/aria/section-header'
import { Button } from '@/components/ui/button'
import { getStoreSettings } from '@/lib/admin/store-settings'
import { getCategories } from '@/lib/db/categories'
import { getFeaturedProducts, getNewArrivals, getProducts } from '@/lib/db/products'
import { debugServer, isServerDebug } from '@/lib/debug'
import { mockMedia } from '@/lib/mock-data'

export default async function HomePage() {
  const [featured, newArrivals, categories, allProducts, storeSettings] = await Promise.all([
    getFeaturedProducts(6).catch(() => []),
    getNewArrivals(6).catch(() => []),
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    getStoreSettings().catch(() => null),
  ])

  const collections = categories.slice(0, 5)
  const heroProduct = featured[0] ?? newArrivals[0] ?? allProducts[0] ?? null
  const heroImage = heroProduct?.images?.[0] ?? heroProduct?.image_url ?? mockMedia.heroLifestyle
  const collectionImages = collections.map((category) => {
    const product = allProducts.find((item) => item.category_id === category.id) ?? featured[0] ?? newArrivals[0]
    return {
      slug: category.slug,
      image: product?.images?.[0] ?? product?.image_url ?? mockMedia.editorialFour,
    }
  })

  const collectionCards = collections.map((category) => {
    const product = allProducts.find((item) => item.category_id === category.id) ?? featured[0] ?? newArrivals[0]
    return {
      category,
      image: product?.images?.[0] ?? product?.image_url ?? mockMedia.editorialFour,
      subtitle: product?.short_description ?? category.description ?? 'Curated for modern luxury dressing.',
    }
  })

  const debugEnabled = isServerDebug()
  if (debugEnabled) {
    debugServer('homepage.storeSettings', {
      hasSettings: Boolean(storeSettings),
      hero_title: storeSettings?.hero_title ?? null,
      hero_cta_url: storeSettings?.hero_cta_url ?? null,
      featured_section_title: storeSettings?.featured_section_title ?? null,
      cta_button_url: storeSettings?.cta_button_url ?? null,
    })
    debugServer('homepage.categories.count', { count: categories.length, slugs: categories.map((category) => category.slug) })
    debugServer('homepage.newArrivals.count', { count: newArrivals.length })
    debugServer('homepage.featuredProducts.count', { count: featured.length })
    debugServer('homepage.images', {
      heroImage,
      collectionImages,
    })
    debugServer('homepage.filters', {
      productStatus: 'active',
      featuredFilter: true,
      categoryLimit: 5,
    })
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-8 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              ARIA Spring Collection
            </div>

            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-foreground text-balance md:text-6xl lg:text-7xl">
              {storeSettings?.hero_title || 'Luxury bags for every quiet statement.'}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {storeSettings?.hero_subtitle || 'Sculpted handbags, refined materials, and a wardrobe of pieces that feel polished from morning meetings to evening reservations.'}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-12 rounded-full bg-primary px-8 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-hover shadow-sm cursor-pointer">
                <Link href={storeSettings?.hero_cta_url || '#collections'}>
                  {storeSettings?.hero_cta_label || 'Shop Collection'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-border bg-white px-8 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-secondary/40 shadow-sm cursor-pointer">
                <Link href="#new-arrivals">Explore New Arrivals</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <FeaturePill title="5 collections" text="Curated by silhouette and mood" />
              <FeaturePill title="Premium leather" text="Structured, soft, and tactile" />
              <FeaturePill title="COD checkout" text="Simple physical-order flow" />
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_12px_40px_-12px_rgba(43,36,32,0.18)]">
              <div className="relative aspect-[4/5]">
                <DebugImage
                  src={heroImage}
                  alt="ARIA hero bag"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  scope="homepage.heroImage"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent" />
              </div>
            </div>

            <div className="absolute -bottom-6 left-4 right-4 grid gap-3 rounded-[1.5rem] border border-border bg-white p-4 shadow-[0_12px_36px_-8px_rgba(43,36,32,0.15)] sm:left-auto sm:right-6 sm:max-w-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">Featured edit</p>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif text-2xl text-foreground">{heroProduct?.name ?? 'ARIA Signature'}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-normal">
                    {heroProduct?.short_description ?? 'A premium piece styled for modern luxury.'}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary whitespace-nowrap">
                  {heroProduct?.sale_price ? 'Now available' : 'New arrival'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {debugEnabled ? (
          <section className="bg-[#f8f1df] border-t border-primary/10">
            <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
              <div className="rounded-2xl border border-dashed border-primary/20 bg-white/80 p-5">
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary/80">ARIA debug</p>
                <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                  <DebugRow label="Categories" value={String(categories.length)} />
                  <DebugRow label="New arrivals" value={String(newArrivals.length)} />
                  <DebugRow label="Featured" value={String(featured.length)} />
                  <DebugRow
                    label="Hero image"
                    value={heroImage ?? 'No image fallback'}
                  />
                  <DebugRow
                    label="Collection images"
                    value={collectionImages.map((entry) => `${entry.slug}: ${entry.image}`).join(' | ')}
                  />
                  <DebugRow
                    label="Store settings"
                    value={storeSettings ? storeSettings.hero_title : 'No store_settings row'}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section id="collections" className="bg-secondary/25 border-t border-b border-border/60">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
            <SectionHeader
              eyebrow="Shop by Silhouette"
              title="Shop by Style"
              description="Each ARIA collection is shaped around a distinct way of dressing, from everyday structure to evening polish."
            />

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {collectionCards.map(({ category, image, subtitle }, index) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)] aria-card-hover"
                >
                  <div className="relative aspect-[4/5]">
                    <DebugImage
                      src={image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, 50vw"
                      className="object-cover aria-zoom-img"
                      scope={`homepage.collection.${category.slug}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent" />
                  </div>
                  <div className="space-y-2 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                      0{index + 1}
                    </p>
                    <h2 className="font-serif text-2xl text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="new-arrivals" className="bg-background text-foreground">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                align="left"
                eyebrow="New Drop"
                title="New Arrivals"
                description="Freshly curated handbags that balance structure, softness, and graceful wearability."
                className="max-w-3xl"
              />
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:text-primary-hover transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12">
              <ProductGrid products={newArrivals} />
            </div>
          </div>
        </section>

        <section id="about" className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
            <SectionHeader
              eyebrow="The ARIA Standard"
              title="Why ARIA"
              description="We focus on the details that make a handbag feel considered: proportion, material, finish, and the ease of everyday wear."
            />

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Feather,
                  title: 'Premium Leather',
                  desc: 'Full-grain materials selected for their texture, depth, and enduring character.',
                },
                {
                  icon: Award,
                  title: 'Hand Finished',
                  desc: 'Precision detailing that feels closer to atelier craft than mass retail.',
                },
                {
                  icon: Truck,
                  title: storeSettings?.promo_enabled ? (storeSettings?.promo_title || 'Complimentary Shipping') : 'Complimentary Shipping',
                  desc: storeSettings?.promo_enabled ? (storeSettings?.promo_description || 'A calm, polished delivery experience that matches the product.') : 'A calm, polished delivery experience that matches the product.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Long-term Care',
                  desc: 'Thoughtful care guidance to help each piece age beautifully.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-border bg-white p-6 shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)] aria-card-hover"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-foreground">{item.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-secondary/40 border-t border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_12px_36px_-12px_rgba(43,36,32,0.15)]">
              <div className="relative aspect-[4/3]">
                <DebugImage
                  src={mockMedia.editorialThree}
                  alt="ARIA editorial"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  scope="homepage.editorialImage"
                />
              </div>
            </div>

            <div className="max-w-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                The edit
              </span>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl whitespace-pre-line">
                {storeSettings?.cta_title || 'Designed to be worn.\nBuilt to be kept.'}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {storeSettings?.cta_subtitle || 'Each ARIA bag is meant to feel like a quiet investment, carrying the kind of polish that works beyond trends and through seasons.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="h-12 rounded-full bg-primary px-8 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-hover shadow-sm cursor-pointer">
                  <Link href={storeSettings?.cta_button_url || '#collections'}>
                    {storeSettings?.cta_button_label || 'Discover the collection'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-border bg-white px-8 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-secondary/40 shadow-sm cursor-pointer">
                  <Link href="#about">Our promise</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function FeaturePill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-white/95 p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/80">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary/70">{label}</p>
      <p className="mt-1 break-words text-xs text-foreground">{value}</p>
    </div>
  )
}
