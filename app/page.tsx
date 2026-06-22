import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getProducts } from '@/lib/db/products';
import { getCategories } from '@/lib/db/categories';
import { Download, Lock, Clock } from 'lucide-react';

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
              {/* Left Column */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-balance">
                  Premium Digital Products, Delivered Instantly
                </h1>
                <p className="text-lg md:text-base text-red-50 mb-8 leading-relaxed">
                  Browse thousands of digital resources, templates, guides, and downloadable products. Get instant access after purchase.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="#featured">
                    <Button size="lg" className="bg-white text-primary hover:bg-slate-100 w-full sm:w-auto">
                      Browse Products
                    </Button>
                  </Link>
                  <Link href="#featured">
                    <Button 
                      size="lg" 
                      className="border-2 border-white text-white hover:bg-white/20 w-full sm:w-auto font-semibold"
                    >
                      See Featured
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column - Instant Access Card */}
              <div className="flex justify-center md:justify-end">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-sm border border-white/30">
                  <div className="flex justify-center mb-4">
                    <Download className="h-16 w-16 text-white/80" />
                  </div>
                  <h3 className="text-center text-2xl font-bold mb-2">Instant Access</h3>
                  <p className="text-center text-red-50">
                    Download immediately after checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-slate-100 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground mb-16">
              Why Choose DigitalHub?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Instant Download</h3>
                </div>
                <p className="text-muted-foreground">
                  Get your digital products immediately after purchase. No waiting, no shipping.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Secure & Reliable</h3>
                </div>
                <p className="text-muted-foreground">
                  All transactions are secure. Your data is protected with industry-standard encryption.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-4 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Lifetime Access</h3>
                </div>
                <p className="text-muted-foreground">
                  Once purchased, you have permanent access to your digital products forever.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="featured" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Products</h2>
              {products.length > 6 && (
                <Link href="/" className="text-primary font-semibold hover:text-red-600 transition-colors">
                  View All →
                </Link>
              )}
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-slate-50 py-16 text-center">
                <p className="text-muted-foreground">No products available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-accent text-white py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-blue-50 mb-8">
              Browse our collection of premium digital products and find exactly what you need.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-accent hover:bg-slate-100">
                Explore Products →
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
