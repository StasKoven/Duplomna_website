'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import s from './Rating.module.css'

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

const inputStarSizes = {
  sm: s.starInputSm,
  md: s.starInputMd,
  lg: s.starInputLg
} as const

export function RatingInput({ value, onChange, size = 'md', readonly = false }: RatingInputProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className={s.inputContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${s.starButton} ${readonly ? s.starButtonReadonly : s.starButtonInteractive}`}
        >
          <Star
            className={`${inputStarSizes[size]} ${
              star <= (hover || value) ? s.starActive : s.starInactive
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

const displayStarSizes = {
  sm: s.starDisplaySm,
  md: s.starDisplayMd,
  lg: s.starDisplayLg
} as const

const textSizes = {
  sm: s.textSm,
  md: s.textMd,
  lg: s.textLg
} as const

export function RatingDisplay({ rating, count, size = 'md', showCount = true }: RatingDisplayProps) {
  return (
    <div className={s.displayContainer}>
      <div className={s.displayStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${displayStarSizes[size]} ${
              star <= Math.round(rating) ? s.starActive : s.starInactive
            }`}
          />
        ))}
      </div>
      <span className={`${textSizes[size]} ${s.ratingText}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={`${textSizes[size]} ${s.countText}`}>
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
    <div className={s.breakdownContainer}>
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className={s.breakdownRow}>
          <div className={s.breakdownLabel}>
            <span className={s.breakdownLabelText}>{star}</span>
            <Star className={s.breakdownStar} />
          </div>
          <div className={s.breakdownBarContainer}>
            <div className={s.breakdownBarBg}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getPercentage(ratings[star as keyof typeof ratings])}%` }}
                transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                className={s.breakdownBarFill}
              />
            </div>
          </div>
          <span className={s.breakdownCount}>
            {ratings[star as keyof typeof ratings]}
          </span>
        </div>
      ))}
    </div>
  )
}
