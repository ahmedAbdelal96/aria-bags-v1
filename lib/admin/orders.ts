import { createClient } from '@/lib/supabase/server';
import type { Order, OrderItem } from '@/lib/types';
import {
  isActiveOrderStatus,
  isFinalOrderStatus,
  normalizeOrderStatus,
} from '@/lib/order-status';

export interface AdminOrderWithDetails extends Order {
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_phone_2?: string | null;
  shipping_city?: string;
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
    const { data: profile } = order.user_id
      ? await supabase
          .from('profiles')
          .select('email')
          .eq('id', order.user_id)
          .maybeSingle()
      : { data: null }

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    ordersWithDetails.push({
      ...order,
      status: normalizeOrderStatus(order.status),
      customer_email: order.customer_email || profile?.email || 'Guest order',
      customer_name: order.customer_name || 'Guest',
      customer_phone: order.customer_phone || undefined,
      customer_phone_2: order.customer_phone_2 || order.shipping_address?.phone_2 || null,
      shipping_city: order.shipping_city || undefined,
      items: items || [],
      item_count: (items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    });
  }

  return ordersWithDetails;
}

export async function getAdminOrderById(id: string): Promise<AdminOrderWithDetails | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!order) return null;

  const { data: profile } = order.user_id
    ? await supabase
        .from('profiles')
        .select('email')
        .eq('id', order.user_id)
        .maybeSingle()
    : { data: null }

  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);

  return {
    ...order,
    status: normalizeOrderStatus(order.status),
    customer_email: order.customer_email || profile?.email || 'Guest order',
    customer_name: order.customer_name || 'Guest',
    customer_phone: order.customer_phone || undefined,
    customer_phone_2: order.customer_phone_2 || order.shipping_address?.phone_2 || null,
    shipping_city: order.shipping_city || undefined,
    items: items || [],
    item_count: (items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
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
  return {
    ...data,
    status: normalizeOrderStatus(data.status),
  };
}

export async function getAdminOrderStats(): Promise<{
  total: number;
  active: number;
  pending_confirmation: number;
  confirmed: number;
  shipping: number;
  delivered: number;
  cancelled_returned: number;
  totalRevenue: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('status, total_amount');

  if (error) throw error;

  const orders = data || [];
  const normalizedOrders = orders.map((order) => ({
    ...order,
    status: normalizeOrderStatus(order.status),
  }));
  return {
    total: normalizedOrders.length,
    active: normalizedOrders.filter((o) => isActiveOrderStatus(o.status)).length,
    pending_confirmation: normalizedOrders.filter((o) => o.status === 'pending_confirmation').length,
    confirmed: normalizedOrders.filter((o) => o.status === 'confirmed').length,
    shipping: normalizedOrders.filter((o) => o.status === 'shipping').length,
    delivered: normalizedOrders.filter((o) => o.status === 'delivered').length,
    cancelled_returned: normalizedOrders.filter((o) => isFinalOrderStatus(o.status) && o.status !== 'delivered').length,
    totalRevenue: normalizedOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };
}
