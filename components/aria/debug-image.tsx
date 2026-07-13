'use client'

import Image, { type ImageProps } from 'next/image'
import { debugClient } from '@/lib/debug'

type DebugImageProps = Omit<ImageProps, 'src' | 'alt' | 'onError'> & {
  src: string
  alt: string
  scope: string
  onError?: ImageProps['onError']
}

export function DebugImage({ src, alt, scope, onError, ...props }: DebugImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      {...props}
      onError={(event) => {
        debugClient('image.error', { src, alt, scope })
        onError?.(event)
      }}
    />
  )
}
