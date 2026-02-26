'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ThumbsUp, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { RatingDisplay } from './Rating'
import { formatDistance } from 'date-fns'
import { uk } from 'date-fns/locale'
import s from './ReviewCard.module.css'

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
      className={s.card}
    >
      <div className={s.content}>
        {/* Аватар користувача */}
        <div className={s.avatarContainer}>
          {review.user.avatar ? (
            <Image
              src={review.user.avatar}
              alt={review.user.firstName}
              width={48}
              height={48}
              className={s.avatarImage}
            />
          ) : (
            <div className={s.avatarPlaceholder}>
              {review.user.firstName[0]}{review.user.lastName[0]}
            </div>
          )}
        </div>

        <div className={s.body}>
          {/* Заголовок */}
          <div className={s.header}>
            <div>
              <div className={s.userNameRow}>
                <h4 className={s.userName}>
                  {review.user.firstName} {review.user.lastName}
                </h4>
                {review.isVerifiedPurchase && (
                  <div className={s.verifiedBadge}>
                    <CheckCircle className={s.verifiedIcon} />
                    <span>Підтверджена покупка</span>
                  </div>
                )}
              </div>
              <RatingDisplay rating={review.rating} showCount={false} size="sm" />
            </div>
            <span className={s.date}>
              {formatDistance(new Date(review.createdAt), new Date(), {
                addSuffix: true,
                locale: uk
              })}
            </span>
          </div>

          {/* Заголовок відгуку */}
          {review.title && (
            <h5 className={s.title}>{review.title}</h5>
          )}

          {/* Коментар */}
          <p className={s.comment}>
            {review.comment}
          </p>

          {/* Зображення */}
          {review.images && review.images.length > 0 && (
            <div className={s.imagesSection}>
              <div className={s.imagesGrid}>
                {displayImages?.map((img, idx) => (
                  <div
                    key={idx}
                    className={s.imageWrapper}
                  >
                    <Image
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      fill
                      sizes="80px"
                      className={s.imageCover}
                    />
                  </div>
                ))}
              </div>
              {review.images.length > 3 && !showAllImages && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className={s.showMoreBtn}
                >
                  Показати ще {review.images.length - 3} фото
                </button>
              )}
            </div>
          )}

          {/* Кнопка "Корисно" */}
          <button
            onClick={() => onHelpful(review._id)}
            className={`${s.helpfulBtn} ${
              isHelpful ? s.helpfulBtnActive : s.helpfulBtnInactive
            }`}
          >
            <ThumbsUp className={`${s.helpfulIcon} ${isHelpful ? s.helpfulIconActive : ''}`} />
            <span>
              Корисно {review.helpful.length > 0 && `(${review.helpful.length})`}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
