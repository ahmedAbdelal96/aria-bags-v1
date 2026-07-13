import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'
import type { ShippingAddress } from '@/lib/types'

export interface GuestOrderCartItem {
  product_id: string
  quantity: number
  selected_color_name?: string | null
}

export interface GuestCheckoutInput {
  customer_name: string
  customer_phone: string
  customer_phone_2?: string | null
  shipping_address: string
  notes?: string | null
  items: GuestOrderCartItem[]
}

export interface GuestOrderCreationResult {
  order_id: string
  confirmation_token: string
  total_amount: number
}

export interface GuestOrderConfirmationResult {
  id: string
  confirmation_token: string
  user_id: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_phone_2: string | null
  notes: string | null
  shipping_address: ShippingAddress
  status: Order['status']
  payment_method: string
  total_amount: number
  created_at: string
  updated_at: string
  items: Array<{
    id: string
    product_id: string
    product_name: string | null
    color_name: string | null
    color_hex: string | null
    quantity: number
    unit_price: number
    total_price: number
    price: number
  }>
}

export async function createGuestOrder(input: GuestCheckoutInput) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('create_guest_order', {
    p_customer_name: input.customer_name,
    p_customer_phone: input.customer_phone,
    p_customer_phone_2: input.customer_phone_2 ?? null,
    p_shipping_address: input.shipping_address,
    p_notes: input.notes ?? null,
    p_items: input.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      color_name: item.selected_color_name ?? null,
    })),
  })

  if (error) throw error

  const payload = Array.isArray(data) ? data[0] : data
  return payload as GuestOrderCreationResult
}

export async function getGuestOrderConfirmation(
  orderId: string,
  confirmationToken: string,
) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_guest_order_confirmation', {
    p_order_id: orderId,
    p_confirmation_token: confirmationToken,
  })

  if (error) throw error

  const payload = Array.isArray(data) ? data[0] : data
  return payload as GuestOrderConfirmationResult | null
}
