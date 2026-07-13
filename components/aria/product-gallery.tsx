'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'
import { DebugImage } from '@/components/aria/debug-image'

interface ProductGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export function ProductGallery({ images, alt, className }: ProductGalleryProps) {
  const safeImages = images.filter(Boolean)
  const [active, setActive] = useState(0)
  const current = safeImages[active]

  if (safeImages.length === 0) {
    return (
      <div
        className={cn(
          'flex aspect-[4/5] w-full items-center justify-center rounded-xl border border-border bg-card/40',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="h-12 w-12" strokeWidth={1.25} />
          <span className="text-xs uppercase tracking-widest">No image</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_8px_24px_-12px_rgba(43,36,32,0.12)]">
        <div className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground backdrop-blur shadow-sm">
          {String(active + 1).padStart(2, '0')} / {String(safeImages.length).padStart(2, '0')}
        </div>
        <DebugImage
          src={current}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover aria-zoom-img"
          scope="product-gallery.main"
        />
      </div>

      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                'relative aspect-square overflow-hidden rounded-2xl border bg-background transition-all cursor-pointer',
                active === i
                  ? 'border-primary ring-2 ring-primary/20 ring-offset-1 ring-offset-background'
                  : 'border-border hover:border-primary/40',
              )}
            >
              <DebugImage
                src={src}
                alt={`${alt} view ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
                scope="product-gallery.thumb"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
