import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[linear-gradient(to_bottom,_#fbf7ef_0%,_#f8f1df_100%)]">
        <section className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
          <span className="text-xs uppercase tracking-[0.32em] text-primary/80">About ARIA</span>
          <h1 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">
            Quiet luxury, made to move with her.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            ARIA is a handbag studio built around sculpted silhouettes, wearable proportions, and
            premium-feeling details without unnecessary complexity. The collection is designed for
            modern routines, elevated outfits, and the calm confidence of a well-chosen bag.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Explore the edit, compare shapes, and find the piece that fits your day.
          </p>
          <div className="mt-8">
            <Link href="/collections" className="text-xs uppercase tracking-[0.22em] text-primary hover:text-primary/80">
              View collections
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
