import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductGrid } from '@/components/aria/product-grid'
import { EmptyState } from '@/components/aria/empty-state'
import { getCategoryBySlug } from '@/lib/db/categories'
import { getProductsByCategorySlug } from '@/lib/db/products'
import { getMockProductsByCategorySlug } from '@/lib/mock-data'
import { debugServer } from '@/lib/debug'
import { Package } from 'lucide-react'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  debugServer('category.requestedSlug', { slug })
  const category = await getCategoryBySlug(slug).catch(() => null)
  debugServer('category.categoryResult', {
    slug,
    found: Boolean(category),
    category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
  })

  if (!category) {
    debugServer('category.error', { slug, message: 'Category not found' })
    notFound()
  }

  const products = await getProductsByCategorySlug(slug).catch(() => getMockProductsByCategorySlug(slug))
  debugServer('category.productsCount', {
    slug,
    count: products.length,
    imagePaths: products.map((product) => product.images?.[0] ?? product.image_url).filter(Boolean),
  })

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="border-b border-border bg-secondary/20 py-8 md:py-10">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80 mb-3">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/collections" className="hover:text-primary transition-colors">Collections</Link>
              <span>/</span>
              <span className="text-foreground">{category.name}</span>
            </nav>

            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-foreground">
                  {category.name}
                </h1>
                {category.description ? (
                  <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                ) : null}
              </div>
              <span className="inline-block rounded-full border border-border bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground w-fit shadow-sm mt-3 md:mt-0">
                {products.length} products
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          {products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No pieces in this collection yet"
              description="We are curating the next drop. Please check back soon."
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <p>Showing {products.length} product{products.length === 1 ? '' : 's'}</p>
                <p>Curated Handbags</p>
              </div>
              
              <ProductGrid products={products} categorySlug={slug} className="lg:grid-cols-4" />

              {products.length === 1 && (
                <div className="mt-8 text-center text-xs text-muted-foreground/80 font-medium tracking-[0.05em]">
                  More styles are coming soon.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
