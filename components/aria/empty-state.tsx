import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-primary/20 bg-card/40 px-6 py-16 md:py-20',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className="font-serif text-2xl text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}