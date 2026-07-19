import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductGrid } from '@/components/aria/product-grid'
import { EmptyState } from '@/components/aria/empty-state'
import { getNewArrivals } from '@/lib/db/products'
import { Package } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Arrivals',
  description: 'Shop the latest ARIA handbags, freshly curated for the newest collection drop.',
  alternates: { canonical: '/new-arrivals' },
}

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(12).catch(() => [])

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="max-w-2xl text-foreground">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">New arrivals</span>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl">The latest ARIA handbags</h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Freshly added styles for the newest drop.
            </p>
            <div className="mt-6">
              <Link href="/collections" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:text-primary-hover">
                Browse collections
              </Link>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={Package}
                title="No new arrivals yet"
                description="Publish active products to see them here."
              />
            </div>
          ) : (
            <div className="mt-10">
              <ProductGrid products={products} />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
