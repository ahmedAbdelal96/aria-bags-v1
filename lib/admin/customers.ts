import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

export async function getAdminCustomers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAdminCustomerById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateAdminCustomer(
  id: string,
  updates: Partial<Pick<Profile, 'is_admin'>>
): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAdminCustomerStats(): Promise<{
  total: number;
  admins: number;
  customers: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('is_admin');

  if (error) throw error;

  const profiles = data || [];
  return {
    total: profiles.length,
    admins: profiles.filter((p) => p.is_admin).length,
    customers: profiles.filter((p) => !p.is_admin).length,
  };
}
