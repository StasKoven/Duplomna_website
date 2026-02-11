'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

export function RatingInput({ value, onChange, size = 'md', readonly = false }: RatingInputProps) {
  const [hover, setHover] = useState(0)

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

interface RatingDisplayProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export function RatingDisplay({ rating, count, size = 'md', showCount = true }: RatingDisplayProps) {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizes[size]} ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className={`${textSizes[size]} font-medium`}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={`${textSizes[size]} text-muted-foreground`}>
          ({count})
        </span>
      )}
    </div>
  )
}

interface RatingBreakdownProps {
  ratings: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  totalCount: number
}

export function RatingBreakdown({ ratings, totalCount }: RatingBreakdownProps) {
  const getPercentage = (count: number) => {
    return totalCount > 0 ? (count / totalCount) * 100 : 0
  }

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-3">
          <div className="flex items-center gap-1 w-12">
            <span className="text-sm font-medium">{star}</span>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getPercentage(ratings[star as keyof typeof ratings])}%` }}
                transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                className="h-full bg-yellow-400"
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground w-12 text-right">
            {ratings[star as keyof typeof ratings]}
          </span>
        </div>
      ))}
    </div>
  )
}
