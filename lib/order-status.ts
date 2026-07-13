export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; shortLabel: string }
> = {
  pending_confirmation: { label: 'Not confirmed', shortLabel: 'Not confirmed' },
  confirmed: { label: 'Confirmed', shortLabel: 'Confirmed' },
  shipping: { label: 'Shipping', shortLabel: 'Shipping' },
  delivered: { label: 'Delivered', shortLabel: 'Delivered' },
  cancelled: { label: 'Cancelled', shortLabel: 'Cancelled' },
  returned: { label: 'Returned', shortLabel: 'Returned' },
}

export const ORDER_STATUS_SET = new Set<OrderStatus>([
  'pending_confirmation',
  'confirmed',
  'shipping',
  'delivered',
  'cancelled',
  'returned',
])

const ORDER_STATUS_INPUT_SET = new Set<string>([
  ...ORDER_STATUS_SET,
  'pending',
  'processing',
  'preparing',
  'shipped',
  'completed',
  'failed',
])

export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending_confirmation: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  shipping: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
  returned: 'bg-slate-100 text-slate-700 border-slate-200',
}

export const ORDER_STATUS_FLOW: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered', 'returned', 'cancelled'],
  delivered: [],
  cancelled: [],
  returned: [],
}

export const ACTIVE_ORDER_STATUSES = [
  'pending_confirmation',
  'confirmed',
  'shipping',
] as const satisfies readonly OrderStatus[]

export const ACTIVE_ORDER_STATUS_SET = new Set<OrderStatus>(ACTIVE_ORDER_STATUSES)

export const FINAL_ORDER_STATUSES = [
  'delivered',
  'cancelled',
  'returned',
] as const satisfies readonly OrderStatus[]

export const FINAL_ORDER_STATUS_SET = new Set<OrderStatus>(FINAL_ORDER_STATUSES)

export const ORDER_STATUS_TABS: Array<{
  value: 'active' | 'pending_confirmation' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'returned' | 'all'
  label: string
  statuses: OrderStatus[] | null
}> = [
  { value: 'active', label: 'Active Orders', statuses: [...ACTIVE_ORDER_STATUSES] },
  { value: 'pending_confirmation', label: 'Pending Confirmation', statuses: ['pending_confirmation'] },
  { value: 'confirmed', label: 'Confirmed', statuses: ['confirmed'] },
  { value: 'shipping', label: 'Shipping', statuses: ['shipping'] },
  { value: 'delivered', label: 'Delivered', statuses: ['delivered'] },
  { value: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
  { value: 'returned', label: 'Returned', statuses: ['returned'] },
  { value: 'all', label: 'All', statuses: null },
]

export function normalizeOrderStatus(status?: string | null): OrderStatus {
  const normalized = (status || '').trim().toLowerCase()

  switch (normalized) {
    case 'pending':
    case 'pending_confirmation':
      return 'pending_confirmation'
    case 'processing':
    case 'preparing':
    case 'confirmed':
      return 'confirmed'
    case 'shipped':
    case 'shipping':
      return 'shipping'
    case 'completed':
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'cancelled'
    case 'returned':
      return 'returned'
    case 'failed':
      return 'cancelled'
    default:
      return 'pending_confirmation'
  }
}

export function isOrderStatus(value?: string | null) {
  const normalized = (value || '').trim().toLowerCase()
  return ORDER_STATUS_INPUT_SET.has(normalized)
}

export function isActiveOrderStatus(status?: string | null) {
  return ACTIVE_ORDER_STATUS_SET.has(normalizeOrderStatus(status))
}

export function isFinalOrderStatus(status?: string | null) {
  return FINAL_ORDER_STATUS_SET.has(normalizeOrderStatus(status))
}

export function getOrderStatusLabel(status?: string | null) {
  const normalized = normalizeOrderStatus(status)
  return ORDER_STATUS_LABELS[normalized].label
}

export function getOrderStatusBadgeClass(status?: string | null) {
  return ORDER_STATUS_BADGE_CLASSES[normalizeOrderStatus(status)]
}

export function getOrderStatusCustomerMessage(status?: string | null) {
  const normalized = normalizeOrderStatus(status)

  switch (normalized) {
    case 'pending_confirmation':
      return 'We received your order and will call to confirm.'
    case 'confirmed':
      return 'Your order has been confirmed and is being prepared.'
    case 'shipping':
      return 'Your order is on the way.'
    case 'delivered':
      return 'Your order has been delivered.'
    case 'cancelled':
      return 'This order was cancelled by the store.'
    case 'returned':
      return 'This order was returned after shipment.'
    default:
      return 'We are processing your order.'
  }
}

export function canTransitionOrderStatus(fromStatus?: string | null, toStatus?: string | null) {
  const from = normalizeOrderStatus(fromStatus)
  const to = normalizeOrderStatus(toStatus)
  return ORDER_STATUS_FLOW[from].some((candidate) => candidate === to)
}
