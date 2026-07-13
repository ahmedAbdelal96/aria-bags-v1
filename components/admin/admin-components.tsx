import React from 'react'
import { LucideIcon } from 'lucide-react'
import {
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  isOrderStatus,
  normalizeOrderStatus,
} from '@/lib/order-status'

interface AdminPageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function AdminPageHeader({ title, description, children }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-admin-border pb-5 mb-6">
      <div>
        <h1 className="font-sans text-2xl font-bold text-admin-text tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 font-sans text-sm text-admin-muted-text">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  )
}

interface AdminStatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
}

export function AdminStatCard({ title, value, description, icon: Icon }: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-card p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-admin-muted-text">
            {title}
          </span>
          <div className="font-sans text-3xl font-bold text-admin-text tracking-tight">
            {value}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-soft text-admin-primary border border-admin-border flex-shrink-0">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      </div>
      {description && (
        <p className="mt-2 text-xs text-admin-muted-text">{description}</p>
      )}
    </div>
  )
}

interface AdminStatusBadgeProps {
  status: string
  label?: string
}

const BADGE_STYLES: Record<string, string> = {
  pending_confirmation: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
  shipping: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  returned: 'bg-slate-100 text-slate-700 border-slate-200',
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  draft: 'bg-amber-50 text-amber-800 border-amber-200',
  archived: 'bg-zinc-100 text-zinc-700 border-zinc-200',
}

const BADGE_LABELS: Record<string, string> = {
  pending_confirmation: 'Not confirmed',
  confirmed: 'Confirmed',
  shipping: 'Shipping',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
}

export function AdminStatusBadge({ status, label }: AdminStatusBadgeProps) {
  const lower = status.toLowerCase()
  const orderStatus = isOrderStatus(status) ? normalizeOrderStatus(status) : null
  const style = orderStatus
    ? getOrderStatusBadgeClass(orderStatus)
    : BADGE_STYLES[lower] ?? 'bg-zinc-50 text-zinc-800 border-zinc-200'
  const displayLabel = label
    ? label
    : orderStatus
      ? BADGE_LABELS[orderStatus] ?? getOrderStatusLabel(orderStatus)
      : BADGE_LABELS[lower] ?? status

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${style} whitespace-nowrap`}>
      {displayLabel}
    </span>
  )
}
