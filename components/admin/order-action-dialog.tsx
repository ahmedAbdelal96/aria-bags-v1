'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export type OrderActionType = 'cancel' | 'return'

interface OrderActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  actionType: OrderActionType | null
  orderRef: string
  customerName: string
}

const CANCEL_REASONS = [
  { value: 'customer_did_not_answer', label: 'Customer did not answer' },
  { value: 'customer_cancelled', label: 'Customer cancelled' },
  { value: 'wrong_address', label: 'Wrong address' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'duplicate_order', label: 'Duplicate order' },
  { value: 'other', label: 'Other' },
]

const RETURN_REASONS = [
  { value: 'customer_refused_delivery', label: 'Customer refused delivery' },
  { value: 'customer_not_available', label: 'Customer did not answer courier' },
  { value: 'wrong_address', label: 'Wrong address' },
  { value: 'delayed_delivery', label: 'Delayed delivery' },
  { value: 'package_issue', label: 'Package issue' },
  { value: 'other', label: 'Other' },
]

export function OrderActionDialog({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  orderRef,
  customerName,
}: OrderActionDialogProps) {
  const [reason, setReason] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const isCancel = actionType === 'cancel'
  const title = isCancel ? 'Cancel order' : 'Mark as returned'
  const description = isCancel
    ? 'Choose why this order is being cancelled.'
    : 'Choose why this order was returned.'
  const confirmText = isCancel ? 'Cancel order' : 'Mark returned'
  const reasons = isCancel ? CANCEL_REASONS : RETURN_REASONS

  const handleConfirm = async () => {
    if (!reason) return
    setLoading(true)
    setError(null)
    try {
      await onConfirm(reason)
      setReason('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      setReason('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-admin-border bg-admin-card p-6 rounded-xl max-w-md font-sans">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-admin-text">{title}</DialogTitle>
          <DialogDescription className="text-xs text-admin-muted-text">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-admin-soft border border-admin-border px-3.5 py-2.5 text-xs text-admin-muted-text space-y-1">
            <p>
              Order: <span className="font-mono font-bold text-admin-text">{orderRef}</span>
            </p>
            <p>
              Customer: <span className="font-semibold text-admin-text">{customerName}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-admin-muted-text">
              Reason
            </label>
            <Select value={reason} onValueChange={setReason} disabled={loading}>
              <SelectTrigger className="w-full h-10 border-admin-border bg-admin-card rounded-lg text-admin-text text-sm">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent className="border-admin-border bg-admin-card text-admin-text rounded-lg">
                {reasons.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    className="focus:bg-admin-soft focus:text-admin-text cursor-pointer"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-admin-border/50 pt-4">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => handleOpenChange(false)}
            className="h-10 border border-admin-border bg-admin-card text-admin-text hover:bg-admin-soft rounded-lg text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || !reason}
            onClick={handleConfirm}
            className={`h-10 rounded-lg text-xs font-semibold text-white cursor-pointer ${
              isCancel
                ? 'bg-rose-600 hover:bg-rose-700 border-0'
                : 'bg-admin-primary hover:bg-admin-primary-hover border-0'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
