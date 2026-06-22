'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'

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
          'flex aspect-[4/5] w-full items-center justify-center rounded-xl border border-primary/15 bg-card/40',
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
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-primary/15 bg-card/40">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover aria-zoom-img"
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
                'relative aspect-square overflow-hidden rounded-md border transition-all',
                active === i
                  ? 'border-primary ring-1 ring-primary/40'
                  : 'border-primary/15 hover:border-primary/40',
              )}
            >
              <Image
                src={src}
                alt={`${alt} view ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}