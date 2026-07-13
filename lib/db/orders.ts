import { createClient } from '@/lib/supabase/server'
import type { Order, OrderItem, ShippingAddress, PaymentMethod } from '@/lib/types'
import { normalizeOrderStatus } from '@/lib/order-status'

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(normalizeOrder)
}

export async function getOrderById(orderId: string, userId: string): Promise<Order | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data ? normalizeOrder(data as Record<string, unknown>) : null
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (error) throw error
  return (data || []).map((row) => normalizeOrderItem(row as Record<string, unknown>))
}

export interface CreateOrderInput {
  user_id: string | null
  status?: Order['status']
  total_amount: number
  payment_method?: PaymentMethod
  shipping_address: ShippingAddress
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  customer_phone_2?: string | null
  shipping_city?: string | null
  notes?: string | null
}

export async function createOrder(order: CreateOrderInput): Promise<Order> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: order.user_id,
        customer_name: order.customer_name ?? order.shipping_address.full_name,
        customer_email: order.customer_email ?? null,
        customer_phone: order.customer_phone ?? order.shipping_address.phone,
        customer_phone_2: order.customer_phone_2 ?? order.shipping_address.phone_2 ?? null,
        shipping_city: order.shipping_city ?? null,
        notes: order.notes ?? order.shipping_address.notes ?? null,
        status: order.status ?? 'pending_confirmation',
        total_amount: order.total_amount,
        payment_method: order.payment_method ?? 'cod',
        shipping_address: order.shipping_address,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return normalizeOrder(data as Record<string, unknown>)
}

export interface AddOrderItemInput {
  order_id: string
  product_id: string
  color_name?: string | null
  color_hex?: string | null
  quantity: number
  price: number
}

export async function addOrderItem(item: AddOrderItemInput): Promise<OrderItem> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('order_items')
    .insert([
      {
        order_id: item.order_id,
        product_id: item.product_id,
        color_name: item.color_name ?? null,
        color_hex: item.color_hex ?? null,
        quantity: item.quantity,
        price: item.price,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return normalizeOrderItem(data as Record<string, unknown>)
}

export async function updateOrderStatus(orderId: string, userId: string, status: Order['status']): Promise<Order> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return normalizeOrder(data as Record<string, unknown>)
}

export async function deleteOrder(orderId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').delete().eq('id', orderId).eq('user_id', userId)

  if (error) throw error
}

/* -------- normalization helpers -------- */

function normalizeOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    user_id: (row.user_id as string | null) ?? null,
    confirmation_token: (row.confirmation_token as string | null) ?? null,
    customer_name: (row.customer_name as string | null) ?? null,
    customer_email: (row.customer_email as string | null) ?? null,
    customer_phone: (row.customer_phone as string | null) ?? null,
    customer_phone_2: (row.customer_phone_2 as string | null) ?? null,
    shipping_city: (row.shipping_city as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    confirmation_attempts: row.confirmation_attempts != null ? Number(row.confirmation_attempts) : undefined,
    last_contact_attempt_at: (row.last_contact_attempt_at as string | null) ?? null,
    status_updated_at: (row.status_updated_at as string | null) ?? null,
    confirmed_at: (row.confirmed_at as string | null) ?? null,
    shipping_at: (row.shipping_at as string | null) ?? null,
    delivered_at: (row.delivered_at as string | null) ?? null,
    cancelled_at: (row.cancelled_at as string | null) ?? null,
    returned_at: (row.returned_at as string | null) ?? null,
    cancellation_reason: (row.cancellation_reason as string | null) ?? null,
    return_reason: (row.return_reason as string | null) ?? null,
    internal_notes: (row.internal_notes as string | null) ?? null,
    status: normalizeOrderStatus(row.status as string | null),
    total_amount: Number(row.total_amount ?? 0),
    payment_method: ((row.payment_method as PaymentMethod) ?? 'cod'),
    shipping_address:
      (row.shipping_address as ShippingAddress) ??
      ({
        full_name: (row.customer_name as string | null) ?? '',
        phone: (row.customer_phone as string | null) ?? '',
        phone_2: (row.customer_phone_2 as string | null) ?? null,
        address: '',
        notes: (row.notes as string | null) ?? null,
      } as ShippingAddress),
    created_at: (row.created_at as string) ?? '',
    updated_at: (row.updated_at as string) ?? '',
  }
}

function normalizeOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as string,
    order_id: row.order_id as string,
    product_id: row.product_id as string,
    product_name: (row.product_name as string | null) ?? null,
    color_name: (row.color_name as string | null) ?? null,
    color_hex: (row.color_hex as string | null) ?? null,
    quantity: Number(row.quantity ?? 1),
    price: Number(row.price ?? 0),
    unit_price: row.unit_price != null ? Number(row.unit_price) : null,
    total_price: row.total_price != null ? Number(row.total_price) : null,
    created_at: (row.created_at as string) ?? '',
  }
}
