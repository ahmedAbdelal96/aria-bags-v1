import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

export interface AdminProductFilters {
  status?: string;
  category_id?: string;
  search?: string;
  featured?: boolean;
}

export async function getAdminProducts(filters?: AdminProductFilters): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from('products').select('*').order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.category_id && filters.category_id !== 'all') {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters?.featured !== undefined) {
    query = query.eq('is_featured', filters.featured);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createAdminProduct(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'views' | 'downloads'>
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAdminProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'views' | 'downloads'>>
): Promise<Product> {
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

export async function deleteAdminProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) throw error;
}

export async function publishAdminProduct(id: string): Promise<Product> {
  return updateAdminProduct(id, { status: 'active' });
}

export async function draftAdminProduct(id: string): Promise<Product> {
  return updateAdminProduct(id, { status: 'draft' });
}

export async function archiveAdminProduct(id: string): Promise<Product> {
  return updateAdminProduct(id, { status: 'archived' });
}

export async function toggleAdminProductFeatured(id: string, featured: boolean): Promise<Product> {
  return updateAdminProduct(id, { is_featured: featured });
}

export async function getAdminProductStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('status, is_featured');

  if (error) throw error;

  const products = data || [];
  return {
    total: products.length,
    published: products.filter((p) => p.status === 'active').length,
    draft: products.filter((p) => p.status === 'draft').length,
    archived: products.filter((p) => p.status === 'archived').length,
    featured: products.filter((p) => p.is_featured).length,
  };
}
