import { ProductForm } from '@/components/admin/product-form';
import { getProductById } from '@/lib/db/products';
import { getCategories } from '@/lib/db/categories';
import { notFound } from 'next/navigation';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product details</p>
      </div>

      <ProductForm product={product} categories={categories} />
    </div>
  );
}
