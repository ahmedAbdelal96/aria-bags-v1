import { createClient } from '@/lib/supabase/server';
import type { Order, OrderItem } from '@/lib/types';

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(orderId: string, userId: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return data || [];
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addOrderItem(item: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('order_items')
    .insert([item])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, userId: string, status: Order['status']): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOrder(orderId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('orders').delete().eq('id', orderId).eq('user_id', userId);

  if (error) throw error;
}
