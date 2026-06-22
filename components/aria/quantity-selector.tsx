'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  disabled?: boolean
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  disabled = false,
}: QuantitySelectorProps) {
  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(Math.min(max, value + 1))

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border border-primary/25 bg-card/60 overflow-hidden',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      role="group"
      aria-label="Quantity selector"
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="h-10 w-10 flex items-center justify-center text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className="w-10 text-center text-sm font-medium tabular-nums text-foreground"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="h-10 w-10 flex items-center justify-center text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}