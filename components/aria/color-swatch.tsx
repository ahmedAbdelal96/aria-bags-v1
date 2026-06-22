'use client'

import { cn } from '@/lib/utils'

interface ColorSwatchProps {
  name: string
  /** Any CSS color string (hex, rgb, etc.) */
  value: string
  selected?: boolean
  onSelect?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
}

export function ColorSwatch({
  name,
  value,
  selected = false,
  onSelect,
  disabled = false,
  size = 'md',
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={`Color ${name}`}
      aria-pressed={selected}
      title={name}
      className={cn(
        'group relative rounded-full border transition-all',
        sizeMap[size],
        selected
          ? 'border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
          : 'border-primary/25 hover:border-primary/60',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      <span
        className="absolute inset-1 rounded-full"
        style={{ backgroundColor: value }}
      />
    </button>
  )
}