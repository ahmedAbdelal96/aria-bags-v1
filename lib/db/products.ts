import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from('products').select('*').eq('status', 'active');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getProductBySlug(slug: string, categoryId?: string): Promise<Product | null> {
  const supabase = await createClient();
  let query = supabase.from('products').select('*').eq('slug', slug);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'views' | 'downloads'>): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) throw error;
}

export async function incrementProductViews(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('increment_product_views', { product_id: id });

  if (error && error.code !== 'PGRST204') throw error;
}

export async function getAllProductsAdmin(filters?: { status?: string; search?: string }): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from('products').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
