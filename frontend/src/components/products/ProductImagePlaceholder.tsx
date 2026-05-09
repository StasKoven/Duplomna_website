'use client'

import { ImageOff } from 'lucide-react'

interface Props {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const iconSize: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-5 w-5',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
}

const labelSize: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
}

export default function ProductImagePlaceholder({ label, size = 'md', className }: Props) {
  return (
    <div
      className={
        'flex h-full w-full flex-col items-center justify-center gap-1.5 ' +
        'bg-gradient-to-br from-muted/40 to-muted/70 text-muted-foreground ' +
        (className ?? '')
      }
    >
      <ImageOff className={`${iconSize[size]} opacity-60`} aria-hidden />
      {label && size !== 'sm' && (
        <span className={`${labelSize[size]} font-medium uppercase tracking-wider opacity-70`}>
          {label}
        </span>
      )}
    </div>
  )
}
