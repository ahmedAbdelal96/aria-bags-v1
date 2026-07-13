import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { StoreSettings } from './settings';
import { defaultStoreSettings } from './settings';
import { debugServer, debugSupabaseResult } from '@/lib/debug'

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  debugSupabaseResult('storeSettings', { data, error })
  
  if (data) {
    debugServer('storeSettings.count', { count: 1 })
    return data as StoreSettings;
  }

  // If no settings exist in DB, create one using admin service key
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    if (serviceKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const adminClient = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
      const { data: inserted, error: insertError } = await adminClient
        .from('store_settings')
        .insert([defaultStoreSettings])
        .select()
        .maybeSingle();
      
      if (!insertError && inserted) {
        debugServer('storeSettings.count', { count: 1, action: 'auto-seeded' })
        return inserted as StoreSettings;
      } else if (insertError) {
        console.error('Error inserting default store settings:', insertError)
      }
    }
  } catch (e) {
    console.error('Error auto-seeding store_settings:', e)
  }

  // Fallback to local defaults if DB seeding is unavailable
  return {
    id: '00000000-0000-0000-0000-000000000000',
    ...defaultStoreSettings,
    updated_at: new Date().toISOString(),
  } as StoreSettings;
}

export async function updateStoreSettings(
  updates: Partial<Omit<StoreSettings, 'id' | 'updated_at'>>
): Promise<StoreSettings> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('store_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

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
