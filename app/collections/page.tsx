import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { EmptyState } from '@/components/aria/empty-state'
import { getCategories } from '@/lib/db/categories'
import { getProducts } from '@/lib/db/products'
import { Package } from 'lucide-react'

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([getCategories().catch(() => []), getProducts().catch(() => [])])

  const cards = categories.map((category) => {
    const product = products.find((item) => item.category_id === category.id) ?? products[0] ?? null
    return {
      category,
      image: product?.images?.[0] ?? product?.image_url ?? '/seed/handbags/aria-classic-tote.webp',
      subtitle: product?.short_description ?? category.description ?? 'Curated ARIA handbags.',
    }
  })

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">Collections</span>
            <h1 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">Shop the full ARIA edit</h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Browse handbag collections by silhouette, mood, and occasion.
            </p>
          </div>

          {cards.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={Package}
                title="No collections yet"
                description="Seed the categories table to see collection cards here."
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map(({ category, image, subtitle }) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)] aria-card-hover"
                >
                  <div className="relative aspect-[4/5]">
                    <Image src={image} alt={category.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover aria-zoom-img" />
                  </div>
                  <div className="space-y-2 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">{category.slug}</p>
                    <h2 className="font-serif text-2xl text-foreground group-hover:text-primary transition-colors">{category.name}</h2>
                    <p className="text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
