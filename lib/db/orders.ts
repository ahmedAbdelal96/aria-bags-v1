import { createClient } from '@/lib/supabase/server'
import type { Order, OrderItem, ShippingAddress, PaymentMethod } from '@/lib/types'

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
  user_id: string
  status?: Order['status']
  total_amount: number
  payment_method?: PaymentMethod
  shipping_address: ShippingAddress
}

export async function createOrder(order: CreateOrderInput): Promise<Order> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: order.user_id,
        status: order.status ?? 'pending',
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
    user_id: (row.user_id as string) ?? '',
    status: (row.status as Order['status']) ?? 'pending',
    total_amount: Number(row.total_amount ?? 0),
    payment_method: ((row.payment_method as PaymentMethod) ?? 'cod'),
    shipping_address: (row.shipping_address as ShippingAddress) ?? {
      full_name: '',
      phone: '',
      email: null,
      address: '',
      city: '',
      notes: null,
    },
    created_at: (row.created_at as string) ?? '',
    updated_at: (row.updated_at as string) ?? '',
  }
}

function normalizeOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as string,
    order_id: row.order_id as string,
    product_id: row.product_id as string,
    color_name: (row.color_name as string | null) ?? null,
    color_hex: (row.color_hex as string | null) ?? null,
    quantity: Number(row.quantity ?? 1),
    price: Number(row.price ?? 0),
    created_at: (row.created_at as string) ?? '',
  }
}