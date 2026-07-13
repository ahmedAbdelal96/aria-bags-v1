import { ProductForm } from '@/components/admin/product-form';
import { getCategories } from '@/lib/db/categories';
import { AdminPageHeader } from '@/components/admin/admin-components'

export default async function NewProductPage() {
  const categories = await getCategories().catch(() => []);

  return (
    <div className="space-y-6 font-sans">
      <AdminPageHeader
        title="Add product"
        description="Create a new luxury handbag listing in the store catalog."
      />

      <ProductForm categories={categories} />
    </div>
  );
}
