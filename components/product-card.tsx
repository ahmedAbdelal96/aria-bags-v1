'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { useCart } from '@/lib/store/cart';
import { Download, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  categorySlug?: string;
}

export function ProductCard({ product, categorySlug }: ProductCardProps) {
  const { addItem } = useCart();
  const productLink = categorySlug
    ? `/products/${categorySlug}/${product.slug}`
    : `/products/${product.slug}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:shadow-lg">
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <div className="text-center">
              <Download className="mx-auto h-12 w-12 text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-500">Digital Product</span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="inline-block bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
            Instant
          </span>
          {product.downloads > 100 && (
            <span className="inline-block bg-accent text-white text-xs font-semibold px-2 py-1 rounded">
              Popular
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground mb-1">
          {product.name}
        </h3>

        <p className="line-clamp-2 text-xs text-muted-foreground mb-3 flex-1">
          {product.description}
        </p>

        {/* Metadata */}
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{product.downloads}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>4.8</span>
          </div>
          {product.file_size && (
            <span>{(product.file_size / 1024 / 1024).toFixed(1)}MB</span>
          )}
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex gap-2">
            <Link href={productLink} className="flex-1">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-slate-600 hover:text-slate-900 border-slate-300"
              >
                Details
              </Button>
            </Link>
            <Button 
              size="sm" 
              onClick={() => addItem(product)}
              className="flex-1 bg-primary hover:bg-red-600 text-white"
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
