import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { getCategoryBySlug } from '@/lib/db/categories';
import { getProducts } from '@/lib/db/products';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug).catch(() => null),
    getProducts().catch(() => []),
  ]);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter((p) => p.category_id === category.id);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        {/* Header */}
        <div className="bg-primary text-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <Link href="/" className="text-sm text-red-100 hover:text-white transition-colors inline-flex items-center gap-2">
              ← Back to Home
            </Link>
            <h1 className="mt-6 text-5xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="mt-3 text-lg text-red-50">{category.description}</p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          {categoryProducts.length > 0 ? (
            <>
              <p className="mb-8 text-muted-foreground text-sm">
                Showing {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} categorySlug={slug} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-slate-50 py-16 text-center">
              <p className="mb-6 text-muted-foreground text-lg">No products in this category yet</p>
              <Link href="/">
                <Button variant="outline" className="border-slate-300">Browse All Categories</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
