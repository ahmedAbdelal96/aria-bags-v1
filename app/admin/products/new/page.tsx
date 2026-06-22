import { ProductForm } from '@/components/admin/product-form';
import { getCategories } from '@/lib/db/categories';

export default async function NewProductPage() {
  const categories = await getCategories().catch(() => []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new digital product for your store</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
