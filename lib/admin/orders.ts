import { createClient } from '@/lib/supabase/server';
import type { Order, OrderItem } from '@/lib/types';

export interface AdminOrderWithDetails extends Order {
  customer_email?: string;
  items?: OrderItem[];
  item_count?: number;
}

export async function getAdminOrders(): Promise<AdminOrderWithDetails[]> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const ordersWithDetails: AdminOrderWithDetails[] = [];

  for (const order of orders || []) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', order.user_id)
      .single();

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    ordersWithDetails.push({
      ...order,
      customer_email: profile?.email || 'Unknown',
      items: items || [],
      item_count: (items || []).length,
    });
  }

  return ordersWithDetails;
}

export async function getAdminOrderById(id: string): Promise<AdminOrderWithDetails | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!order) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', order.user_id)
    .single();

  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);

  return {
    ...order,
    customer_email: profile?.email || 'Unknown',
    items: items || [],
    item_count: (items || []).length,
  };
}

export async function updateAdminOrderStatus(
  id: string,
  status: Order['status']
): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAdminOrderStats(): Promise<{
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalRevenue: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('status, total_amount');

  if (error) throw error;

  const orders = data || [];
  return {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    failed: orders.filter((o) => o.status === 'failed' || o.status === 'cancelled').length,
    totalRevenue: orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };
}
