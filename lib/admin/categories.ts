import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/lib/types';

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAdminCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createAdminCategory(
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAdminCategory(
  id: string,
  updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAdminCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', id)
    .limit(1);

  if (productsError) {
    return { success: false, error: 'Failed to check products' };
  }

  if (products && products.length > 0) {
    return {
      success: false,
      error: 'Cannot delete category that has products. Remove or reassign products first.',
    };
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getAdminCategoryProductCount(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('category_id');

  if (error) throw error;

  const counts: Record<string, number> = {};
  (data || []).forEach((product) => {
    if (product.category_id) {
      counts[product.category_id] = (counts[product.category_id] || 0) + 1;
    }
  });

  return counts;
}
