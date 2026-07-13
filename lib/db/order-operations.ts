import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/lib/order-status'

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  reason: string | null = null,
  internalNotes: string | null = null,
) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_status: status,
    p_reason: reason,
    p_internal_notes: internalNotes,
  })

  if (error) throw error
  return Array.isArray(data) ? data[0] ?? null : data ?? null
}

export async function recordOrderContactAttempt(orderId: string, note: string | null = null) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('record_order_contact_attempt', {
    p_order_id: orderId,
    p_note: note,
  })

  if (error) throw error
  return Array.isArray(data) ? data[0] ?? null : data ?? null
}
