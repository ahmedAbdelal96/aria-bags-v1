import { createClient } from '@/lib/supabase/server';
import type { StoreSettings } from './settings';

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateStoreSettings(
  updates: Partial<Omit<StoreSettings, 'id' | 'updated_at'>>
): Promise<StoreSettings> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('store_settings')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('store_settings')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('store_settings')
      .insert([{ ...updates }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
