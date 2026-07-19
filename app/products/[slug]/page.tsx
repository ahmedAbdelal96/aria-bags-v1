import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductDetailPanel } from '@/components/aria/product-detail-panel'
import { getCategories } from '@/lib/db/categories'
import { getProductBySlug, getProducts } from '@/lib/db/products'
import type { Product } from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)

  if (!product) {
    return { title: 'Handbag' }
  }

  const description = product.short_description || product.description || `Discover the ${product.name} handbag from ARIA.`
  const image = product.images?.[0] || product.image_url || '/logo.jpeg'

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} | ARIA`,
      description,
      url: `/products/${product.slug}`,
      images: [{ url: image, alt: product.name }],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const [categories, allProducts] = await Promise.all([
    getCategories().catch(() => []),
    getProducts(product.category_id).catch(() => []),
  ])

  const category = categories.find((item) => item.id === product.category_id) ?? null
  const related = allProducts.filter((item: Product) => item.id !== product.id).slice(0, 4)

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(199,176,107,0.10),_transparent_35%),linear-gradient(to_bottom,_#f8f1df_0%,_#fbf7ef_28%,_#f7f1e7_100%)]">
        <section className="border-b border-primary/10 bg-background/30">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground"
            >
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span className="text-primary/40">/</span>
              {category ? (
                <>
                  <Link href={`/category/${category.slug}`} className="hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                  <span className="text-primary/40">/</span>
                </>
              ) : null}
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <ProductDetailPanel product={product} category={category} related={related} />
        </div>
      </main>
      <Footer />
    </>
  )
}
