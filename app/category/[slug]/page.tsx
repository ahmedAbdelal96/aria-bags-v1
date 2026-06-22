import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductGrid } from '@/components/aria/product-grid'
import { EmptyState } from '@/components/aria/empty-state'
import { getCategoryBySlug } from '@/lib/db/categories'
import { getProducts } from '@/lib/db/products'
import { notFound } from 'next/navigation'
import { Package } from 'lucide-react'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug).catch(() => null),
    getProducts().catch(() => []),
  ])

  if (!category) {
    notFound()
  }

  const categoryProducts = products.filter((p) => p.category_id === category.id)

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="border-b border-primary/10 bg-gradient-to-b from-card/30 to-background">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <span className="text-xs uppercase tracking-[0.32em] text-primary/80">Collection</span>
            <h1 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">{category.name}</h1>
            {category.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {category.description}
              </p>
            ) : null}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          {categoryProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No pieces in this collection yet"
              description="We're curating the next drop. Please check back soon."
            />
          ) : (
            <>
              <p className="mb-8 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {categoryProducts.length} {categoryProducts.length === 1 ? 'piece' : 'pieces'}
              </p>
              <ProductGrid products={categoryProducts} categorySlug={slug} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}