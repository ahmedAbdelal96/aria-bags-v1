import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div className={cn('flex flex-col gap-3', alignment, className)}>
      {eyebrow ? (
        <span className="text-[11px] uppercase tracking-[0.32em] text-primary/80 font-medium">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground text-balance">
        {title}
      </h2>
      {description ? (
        <p className={cn('text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      ) : null}
    </div>
  )
}