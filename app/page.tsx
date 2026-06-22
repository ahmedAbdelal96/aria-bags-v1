import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Truck, ShieldCheck, Feather, Award } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductGrid } from '@/components/aria/product-grid'
import { SectionHeader } from '@/components/aria/section-header'
import { EmptyState } from '@/components/aria/empty-state'
import { Button } from '@/components/ui/button'
import { getFeaturedProducts, getNewArrivals } from '@/lib/db/products'
import { getCategories } from '@/lib/db/categories'

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(6).catch(() => []),
    getNewArrivals(3).catch(() => []),
    getCategories().catch(() => []),
  ])

  const collections = categories.slice(0, 5)
  const heroImage =
    'https://images.unsplash.com/photo-1590739225497-56c8b6d4b2f0?w=1600&q=80'

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          </div>

          <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-start justify-center px-6 py-24 md:py-32">
            <span className="aria-fade-in text-[11px] uppercase tracking-[0.4em] text-primary/90">
              ARIA — Spring Collection
            </span>
            <h1 className="aria-fade-in aria-fade-in-delay-1 mt-6 max-w-3xl font-serif text-5xl leading-[1.05] text-foreground text-balance md:text-6xl lg:text-7xl">
              Quiet luxury.
              <br />
              <span className="aria-gold-text">Crafted to last.</span>
            </h1>
            <p className="aria-fade-in aria-fade-in-delay-2 mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Discover handbags designed for the modern woman — sculpted silhouettes,
              full-grain leather, and the ARIA signature in every stitch.
            </p>
            <div className="aria-fade-in aria-fade-in-delay-3 mt-10 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 h-12 uppercase tracking-[0.22em] text-xs"
              >
                <Link href="#new-arrivals">
                  Shop the Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary/40 text-foreground hover:bg-primary/10 hover:border-primary rounded-none px-8 h-12 uppercase tracking-[0.22em] text-xs"
              >
                <Link href="#about">Our Story</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CATEGORIES / COLLECTIONS */}
        <section id="collections" className="mx-auto max-w-7xl px-6 py-24 md:py-28">
          <SectionHeader
            eyebrow="Collections"
            title="Find your silhouette"
            description="From everyday totes to evening clutches, each ARIA piece is built to be worn for years."
          />

          {collections.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                icon={Sparkles}
                title="Collections coming soon"
                description="We're curating our first collection. Please check back shortly."
              />
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {collections.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-primary/15 bg-card aria-card-hover"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80">
                      0{i + 1}
                    </p>
                    <h3 className="mt-1 font-serif text-xl text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* FEATURED / NEW ARRIVALS */}
        <section
          id="new-arrivals"
          className="border-y border-primary/10 bg-gradient-to-b from-background via-card/30 to-background"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                align="left"
                eyebrow="New Arrivals"
                title="This season's edit"
                description="Hand-selected pieces from our latest collection."
              />
              <Link
                href="/category/tote-bags"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-primary hover:text-primary/80 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12">
              {newArrivals.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="New pieces on the way"
                  description="Our atelier is finishing the next drop."
                />
              ) : (
                <ProductGrid products={newArrivals} />
              )}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-24 md:py-28">
            <SectionHeader
              eyebrow="Featured"
              title="House favourites"
              description="The pieces our community keeps coming back to."
            />
            <div className="mt-12">
              <ProductGrid products={featured} />
            </div>
          </section>
        )}

        {/* WHY ARIA */}
        <section
          id="about"
          className="border-t border-primary/10 bg-card/40"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
            <SectionHeader
              eyebrow="The ARIA promise"
              title="Why ARIA"
              description="Every detail is intentional — from the leather to the last stitch."
            />

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Feather,
                  title: 'Premium Leather',
                  desc: 'Full-grain Italian and Egyptian leather, hand-selected for character.',
                },
                {
                  icon: Award,
                  title: 'Hand Finished',
                  desc: 'Each piece is finished by our Cairo atelier — never mass-produced.',
                },
                {
                  icon: Truck,
                  title: 'Complimentary Shipping',
                  desc: 'Free insured delivery on every order across the region.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Lifetime Care',
                  desc: 'Free repairs and conditioning for the lifetime of your ARIA piece.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-primary/15 bg-background/50 p-6 aria-card-hover"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LIFESTYLE / EDITORIAL CTA */}
        <section className="relative mx-auto max-w-7xl px-6 py-24 md:py-28">
          <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src="https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=1200&q=80"
                  alt="Editorial"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center gap-5 p-10 lg:p-16">
                <span className="text-[11px] uppercase tracking-[0.4em] text-primary/80">
                  The Edit
                </span>
                <h2 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
                  Designed to be worn.
                  <br />
                  Built to be kept.
                </h2>
                <p className="max-w-md text-muted-foreground leading-relaxed">
                  Each ARIA piece is conceived as a quiet investment — meant to grow with you,
                  carry your story, and outlive every trend.
                </p>
                <div>
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 h-12 uppercase tracking-[0.22em] text-xs"
                  >
                    <Link href="#collections">
                      Discover the collection
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}