import { ProductForm } from '@/components/admin/product-form';
import { getProductById } from '@/lib/db/products';
import { getCategories } from '@/lib/db/categories';
import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/admin-components'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id).catch(() => null),
    getCategories().catch(() => []),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminPageHeader
        title="Edit product"
        description={`Modify details for piece: ${product.name}`}
      >
        {product.status === 'active' ? (
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-admin-border bg-admin-card px-3 text-xs font-semibold text-admin-text hover:bg-admin-soft transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview storefront
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <button
              disabled
              title="Only active products are visible in the storefront."
              className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-admin-border bg-admin-soft px-3 text-xs font-semibold text-admin-muted-text opacity-60 cursor-not-allowed"
            >
              <Eye className="h-4 w-4" />
              Preview storefront
            </button>
            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md font-semibold">
              Only active products are visible in the storefront.
            </span>
          </div>
        )}
      </AdminPageHeader>

      <ProductForm product={product} categories={categories} />
    </div>
  );
}
