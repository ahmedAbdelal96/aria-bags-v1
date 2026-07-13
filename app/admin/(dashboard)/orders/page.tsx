'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Search,
  ShoppingBag,
  Truck,
  Undo2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/aria/empty-state'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/product'
import type { Order } from '@/lib/types'
import { AdminPageHeader, AdminStatCard, AdminStatusBadge } from '@/components/admin/admin-components'
import {
  ORDER_STATUS_TABS,
  getOrderStatusLabel,
  isActiveOrderStatus,
  normalizeOrderStatus,
} from '@/lib/order-status'
import {
  recordOrderContactAttempt,
  updateOrderStatus,
} from '@/lib/db/order-operations'
import { OrderActionDialog, OrderActionType } from '@/components/admin/order-action-dialog'

interface OrderWithDetails extends Order {
  items?: {
    product_name: string | null
    quantity: number
    color_name: string | null
  }[]
}

type TabValue = (typeof ORDER_STATUS_TABS)[number]['value']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabValue>('active')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<{
    type: OrderActionType
    order: OrderWithDetails
  } | null>(null)

  const loadOrders = async () => {
    const supabase = createClient()
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setActionError(error.message)
      setLoading(false)
      return
    }

    const detailed = await Promise.all(
      (ordersData || []).map(async (order) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_name, quantity, color_name')
          .eq('order_id', order.id)

        return {
          ...order,
          status: normalizeOrderStatus(order.status),
          confirmation_attempts: Number(order.confirmation_attempts ?? 0),
          last_contact_attempt_at: order.last_contact_attempt_at ?? null,
          status_updated_at: order.status_updated_at ?? null,
          confirmed_at: order.confirmed_at ?? null,
          shipping_at: order.shipping_at ?? null,
          delivered_at: order.delivered_at ?? null,
          cancelled_at: order.cancelled_at ?? null,
          returned_at: order.returned_at ?? null,
          cancellation_reason: order.cancellation_reason ?? null,
          return_reason: order.return_reason ?? null,
          internal_notes: order.internal_notes ?? null,
          items: items || [],
        } satisfies OrderWithDetails
      }),
    )

    setOrders(detailed)
    setLoading(false)
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const statusCounts = useMemo(() => {
    const normalized = orders.map((order) => ({
      ...order,
      status: normalizeOrderStatus(order.status),
    }))

    return {
      active: normalized.filter((order) => isActiveOrderStatus(order.status)).length,
      pending_confirmation: normalized.filter((order) => order.status === 'pending_confirmation').length,
      confirmed: normalized.filter((order) => order.status === 'confirmed').length,
      shipping: normalized.filter((order) => order.status === 'shipping').length,
      delivered: normalized.filter((order) => order.status === 'delivered').length,
      cancelled: normalized.filter((order) => order.status === 'cancelled').length,
      returned: normalized.filter((order) => order.status === 'returned').length,
      all: normalized.length,
    }
  }, [orders])

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    const tabDefinition = ORDER_STATUS_TABS.find((definition) => definition.value === tab)
    const allowedStatuses = tabDefinition?.statuses

    return orders.filter((order) => {
      const normalizedStatus = normalizeOrderStatus(order.status)
      const matchesTab = !allowedStatuses || allowedStatuses.includes(normalizedStatus)
      const searchableText = [
        order.customer_name,
        order.customer_phone,
        order.customer_phone_2,
        order.shipping_address?.full_name,
        order.shipping_address?.phone,
        order.shipping_address?.phone_2,
        order.shipping_address?.address,
        order.notes,
        order.internal_notes,
        order.cancellation_reason,
        order.return_reason,
        ...(order.items || []).flatMap((item) => [item.product_name, item.color_name]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = query.length === 0 || searchableText.includes(query)

      return matchesTab && matchesSearch
    })
  }, [orders, search, tab])

  const totalRevenue = orders
    .filter((o) => normalizeOrderStatus(o.status) === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0)

  const runStatusUpdate = async (
    order: OrderWithDetails,
    nextStatus: 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'returned',
    reason: string | null = null,
  ) => {
    setUpdatingOrderId(order.id)
    setActionError(null)
    setActionMessage(null)

    try {
      await updateOrderStatus(order.id, nextStatus, reason, null)
      await loadOrders()
      setActionMessage(`Order ${getOrderStatusLabel(nextStatus).toLowerCase()} successfully.`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update order right now.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleConfirmAction = async (reason: string) => {
    if (!activeAction) return
    const nextStatus = activeAction.type === 'cancel' ? 'cancelled' : 'returned'
    await updateOrderStatus(activeAction.order.id, nextStatus, reason, null)
    await loadOrders()
    setActionMessage(`Order ${getOrderStatusLabel(nextStatus).toLowerCase()} successfully.`)
  }

  const handleContactAttempt = async (order: OrderWithDetails) => {
    setUpdatingOrderId(order.id)
    setActionError(null)
    setActionMessage(null)

    try {
      await recordOrderContactAttempt(order.id, 'No answer')
      await loadOrders()
      setActionMessage('Contact attempt recorded.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to record the contact attempt.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <AdminPageHeader
        title="Orders"
        description="Track confirmation calls, shipping, delivery, and exceptions from one simple table."
      >
        <span className="text-sm font-semibold text-admin-muted-text">
          Showing {visibleOrders.length} of {orders.length} orders
        </span>
      </AdminPageHeader>

      {(actionMessage || actionError) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            actionError
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {actionError ?? actionMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <AdminStatCard icon={ShoppingBag} title="Active orders" value={statusCounts.active} />
        <AdminStatCard icon={Clock3} title="Pending confirmation" value={statusCounts.pending_confirmation} />
        <AdminStatCard icon={Truck} title="Confirmed" value={statusCounts.confirmed} />
        <AdminStatCard icon={Undo2} title="Shipping" value={statusCounts.shipping} />
        <AdminStatCard icon={CheckCircle2} title="Delivered" value={statusCounts.delivered} />
        <AdminStatCard icon={AlertTriangle} title="Cancelled / returned" value={statusCounts.cancelled + statusCounts.returned} />
        <AdminStatCard icon={CircleDollarSign} title="Delivered COD sales" value={formatPrice(totalRevenue)} />
      </div>

      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
        <CardHeader className="pb-4 border-b border-admin-border/60">
          <CardTitle className="font-sans text-base font-bold text-admin-text">Find orders</CardTitle>
          <CardDescription className="text-xs text-admin-muted-text">
            Search by customer name, phone, address, notes, product, or internal note.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted-text" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="pl-9 h-10 border-admin-border bg-admin-card rounded-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {ORDER_STATUS_TABS.map((definition) => {
              const count =
                definition.value === 'active'
                  ? statusCounts.active
                  : definition.value === 'pending_confirmation'
                    ? statusCounts.pending_confirmation
                    : definition.value === 'confirmed'
                      ? statusCounts.confirmed
                      : definition.value === 'shipping'
                        ? statusCounts.shipping
                        : definition.value === 'delivered'
                          ? statusCounts.delivered
                          : definition.value === 'cancelled'
                            ? statusCounts.cancelled
                            : definition.value === 'returned'
                              ? statusCounts.returned
                              : statusCounts.all

              const isSelected = tab === definition.value

              return (
                <button
                  key={definition.value}
                  type="button"
                  onClick={() => setTab(definition.value)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-admin-primary bg-admin-primary text-white'
                      : 'border-admin-border bg-admin-card text-admin-text hover:bg-admin-soft'
                  }`}
                >
                  {definition.label}
                  <span className="ml-2 opacity-80">({count})</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-admin-border bg-admin-card shadow-sm rounded-xl">
        <CardHeader className="pb-3 border-b border-admin-border/60">
          <CardTitle className="font-sans text-base font-bold text-admin-text">
            {tab === 'active' ? 'Active orders' : `${ORDER_STATUS_TABS.find((item) => item.value === tab)?.label ?? 'Orders'} orders`}
          </CardTitle>
          <CardDescription className="text-xs text-admin-muted-text">
            Customer details, contact history, and status updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-primary border-t-transparent" />
            </div>
          ) : visibleOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description="Try another search or choose a different tab."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-admin-border">
              <table className="w-full text-left border-collapse">
                <thead className="bg-admin-soft border-b border-admin-border">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-admin-muted-text">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Delivery address</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Attempts</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {visibleOrders.map((order) => {
                    const normalizedStatus = normalizeOrderStatus(order.status)
                    const isBusy = updatingOrderId === order.id
                    const contactButtons = normalizedStatus === 'pending_confirmation'
                      ? [
                          { label: 'Confirm order', action: 'confirmed' as const },
                          { label: 'No answer', action: 'contact' as const },
                          { label: 'Cancel order', action: 'cancelled' as const },
                        ]
                      : normalizedStatus === 'confirmed'
                        ? [
                            { label: 'Start shipping', action: 'shipping' as const },
                            { label: 'Cancel order', action: 'cancelled' as const },
                          ]
                        : normalizedStatus === 'shipping'
                          ? [
                              { label: 'Mark delivered', action: 'delivered' as const },
                              { label: 'Mark returned', action: 'returned' as const },
                              { label: 'Cancel order', action: 'cancelled' as const },
                            ]
                          : []

                    return (
                      <tr key={order.id} className="hover:bg-admin-soft/40 transition-colors align-top">
                        <td className="px-4 py-3.5 text-sm text-admin-text">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-admin-text">
                              {order.customer_name || order.shipping_address?.full_name || 'Guest order'}
                            </p>
                            <p className="text-xs text-admin-muted-text font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-muted-text">
                          <div className="space-y-1">
                            <p className="font-medium text-admin-text">
                              Main: {order.customer_phone || order.shipping_address?.phone || '-'}
                            </p>
                            {order.customer_phone_2 ? (
                              <p className="text-xs">Alt: {order.customer_phone_2}</p>
                            ) : null}
                            <p className="text-xs">
                              Last attempt:{' '}
                              {order.last_contact_attempt_at
                                ? new Date(order.last_contact_attempt_at).toLocaleString()
                                : 'None'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-muted-text leading-relaxed max-w-[220px]">
                          {order.shipping_address?.address || '-'}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-muted-text max-w-[180px]">
                          <div className="space-y-2">
                            <p className="truncate" title={order.notes ?? ''}>
                              {order.notes || '-'}
                            </p>
                            {order.internal_notes ? (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-admin-primary">
                                  Admin notes
                                </summary>
                                <p className="mt-1 whitespace-pre-wrap rounded-md border border-admin-border bg-admin-soft p-2 text-admin-text">
                                  {order.internal_notes}
                                </p>
                              </details>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-text">
                          <div className="space-y-1">
                            <p className="font-semibold">{order.confirmation_attempts ?? 0}</p>
                            <p className="text-xs text-admin-muted-text">
                              Updated:{' '}
                              {order.status_updated_at
                                ? new Date(order.status_updated_at).toLocaleString()
                                : new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-text">
                          {order.items && order.items.length > 0 ? (
                            <ul className="space-y-1 text-xs">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="whitespace-nowrap font-medium">
                                  {item.product_name}
                                  {item.color_name ? ` - ${item.color_name}` : ''}
                                  <span className="ml-1 text-admin-primary font-bold">- Qty {item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-admin-muted-text">0 items</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-bold text-admin-text">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <AdminStatusBadge status={normalizedStatus} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-2">
                            {contactButtons.map((button) => (
                              <button
                                key={button.label}
                                type="button"
                                disabled={isBusy}
                                onClick={() => {
                                  if (button.action === 'contact') {
                                    void handleContactAttempt(order)
                                  } else if (button.action === 'cancelled') {
                                    setActiveAction({ type: 'cancel', order })
                                  } else if (button.action === 'returned') {
                                    setActiveAction({ type: 'return', order })
                                  } else {
                                    void runStatusUpdate(order, button.action)
                                  }
                                }}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                                  button.action === 'cancelled' || button.action === 'returned'
                                    ? 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                                    : 'border border-admin-border bg-admin-card text-admin-text hover:bg-admin-soft'
                                }`}
                              >
                                {isBusy ? 'Saving...' : button.label}
                              </button>
                            ))}

                            {normalizedStatus === 'delivered' ? (
                              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                                Delivered
                              </span>
                            ) : normalizedStatus === 'cancelled' ? (
                              <span className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                                Cancelled
                              </span>
                            ) : normalizedStatus === 'returned' ? (
                              <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                                Returned
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-admin-muted-text">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderActionDialog
        isOpen={activeAction !== null}
        onClose={() => setActiveAction(null)}
        onConfirm={handleConfirmAction}
        actionType={activeAction?.type ?? null}
        orderRef={activeAction ? `#${activeAction.order.id.slice(0, 8).toUpperCase()}` : ''}
        customerName={activeAction ? (activeAction.order.customer_name || activeAction.order.shipping_address?.full_name || 'Guest order') : ''}
      />
    </div>
  )
}
