'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ThumbsUp, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { RatingDisplay } from './Rating'
import { formatDistance } from 'date-fns'
import { uk } from 'date-fns/locale'

interface Review {
  _id: string
  user: {
    firstName: string
    lastName: string
    avatar?: string
  }
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerifiedPurchase: boolean
  helpful: string[]
  createdAt: string
}

interface ReviewCardProps {
  review: Review
  onHelpful: (reviewId: string) => void
  currentUserId?: string
}

export function ReviewCard({ review, onHelpful, currentUserId }: ReviewCardProps) {
  const [showAllImages, setShowAllImages] = useState(false)
  const isHelpful = currentUserId && review.helpful.includes(currentUserId)

  const displayImages = showAllImages ? review.images : review.images?.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b pb-6 last:border-0"
    >
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {review.user.avatar ? (
            <Image
              src={review.user.avatar}
              alt={review.user.firstName}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {review.user.firstName[0]}{review.user.lastName[0]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">
                  {review.user.firstName} {review.user.lastName}
                </h4>
                {review.isVerifiedPurchase && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Підтверджена покупка</span>
                  </div>
                )}
              </div>
              <RatingDisplay rating={review.rating} showCount={false} size="sm" />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistance(new Date(review.createdAt), new Date(), {
                addSuffix: true,
                locale: uk
              })}
            </span>
          </div>

          {/* Title */}
          {review.title && (
            <h5 className="font-medium mb-2">{review.title}</h5>
          )}

          {/* Comment */}
          <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
            {review.comment}
          </p>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {displayImages?.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition"
                  >
                    <Image
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {review.images.length > 3 && !showAllImages && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  Показати ще {review.images.length - 3} фото
                </button>
              )}
            </div>
          )}

          {/* Helpful Button */}
          <button
            onClick={() => onHelpful(review._id)}
            className={`flex items-center gap-2 text-sm transition ${
              isHelpful
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${isHelpful ? 'fill-current' : ''}`} />
            <span>
              Корисно {review.helpful.length > 0 && `(${review.helpful.length})`}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
