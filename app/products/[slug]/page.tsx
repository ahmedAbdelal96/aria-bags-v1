'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/store/cart';
import type { Product, Category } from '@/lib/types';
import { Download, FileText, Clock, Shield } from 'lucide-react';

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const resolveParams = async () => {
      const { slug: paramSlug } = await params;
      setSlug(paramSlug);

      const supabase = createClient();
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', paramSlug)
        .single();

      if (productData) {
        setProduct(productData);

        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', productData.category_id)
          .single();

        if (categoryData) {
          setCategory(categoryData);
        }
      }

      setLoading(false);
    };

    resolveParams();
  }, [params]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="mt-2 text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/" className="mt-4 inline-block">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Breadcrumb */}
          <div className="mb-12 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link href={`/category/${category.slug}`} className="hover:text-foreground transition-colors">
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground font-medium">{product.name}</span>
          </div>

          {/* Product Content */}
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Product Image */}
            <div className="flex flex-col gap-4">
              <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-slate-100 border border-border">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-200 to-slate-300">
                    <Download className="h-16 w-16 text-slate-400 mb-2" />
                    <span className="text-slate-500 font-medium">No preview available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div>
                <div className="mb-3 inline-block rounded-lg bg-primary/10 px-3 py-1">
                  <span className="text-sm font-semibold text-primary">Digital Download</span>
                </div>
                <h1 className="mb-2 text-4xl font-bold text-foreground">{product.name}</h1>
                {category && (
                  <p className="text-base text-muted-foreground">{category.name}</p>
                )}
              </div>

              {/* Price */}
              <div className="border-b border-border pb-8">
                <span className="text-5xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Description */}
              <p className="text-base leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {/* File Info */}
              <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-6">
                <h3 className="font-semibold text-foreground text-sm">File Information</h3>
                <div className="space-y-3">
                  {product.file_size && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>File Size</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {(product.file_size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Instant Access</span>
                    </div>
                    <span className="font-medium text-foreground">After purchase</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Lifetime Access</span>
                    </div>
                    <span className="font-medium text-foreground">Forever yours</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Downloads</p>
                  <p className="text-2xl font-bold text-primary">{product.downloads.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Rating</p>
                  <p className="text-2xl font-bold text-primary">4.8★</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  size="lg" 
                  className="w-full bg-primary hover:bg-red-600 text-white text-base font-semibold"
                  onClick={() => addItem(product)}
                >
                  Add to Cart
                </Button>
              </div>

              {/* Demo Notice */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Demo Checkout</p>
                <p className="mt-1 text-xs text-amber-800">
                  This is a demo storefront. No real payment will be processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
