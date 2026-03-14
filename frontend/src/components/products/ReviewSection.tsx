'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, CheckCircle, MessageSquare, SlidersHorizontal, ChevronDown, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import s from './ReviewSection.module.css'

/* ─── Типи ─── */

interface Review {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  rating: number
  title: string
  comment: string
  images?: string[]
  isVerifiedPurchase: boolean
  helpfulVotes: number
  createdAt: string
}

interface ReviewSectionProps {
  productId: string
  productRating: { average: number; count: number }
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'

/* ─── Константи ─── */

const REVIEWS_PER_PAGE = 5

const RATING_LABELS: Record<number, string> = {
  1: 'Жахливо',
  2: 'Погано',
  3: 'Нормально',
  4: 'Добре',
  5: 'Відмінно',
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Спочатку нові' },
  { value: 'oldest', label: 'Спочатку старі' },
  { value: 'highest', label: 'Висока оцінка' },
  { value: 'lowest', label: 'Низька оцінка' },
  { value: 'helpful', label: 'Найкорисніші' },
]

/* ─── Допоміжні функції ─── */

/** Повертає CSS-клас кольору за значенням рейтингу */
function getRatingColorClass(rating: number): string {
  if (rating >= 4.5) return s.ratingExcellent
  if (rating >= 3.5) return s.ratingGood
  if (rating >= 2.5) return s.ratingAverage
  if (rating >= 1.5) return s.ratingBelowAverage
  return s.ratingPoor
}

/** Форматує дату у вигляді "25 лютого 2026" */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Повертає відносний час ("Сьогодні", "3 дн. тому" тощо) */
function getTimeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return 'Сьогодні'
  if (diffDays === 1) return 'Вчора'
  if (diffDays < 7) return `${diffDays} дн. тому`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} тиж. тому`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} міс. тому`
  return `${Math.floor(diffDays / 365)} р. тому`
}

/** Розбирає текст коментаря на основний текст, переваги і недоліки */
function parseReviewContent(comment: string) {
  const result = { text: comment, pros: '', cons: '' }

  const prosMatch = comment.match(/✅ Переваги: (.+?)(?=\n❌|$)/s)
  const consMatch = comment.match(/❌ Недоліки: (.+?)$/s)

  if (prosMatch) {
    result.pros = prosMatch[1].trim()
    result.text = comment.replace(/\n\n✅ Переваги:.+$/s, '').trim()
  }
  if (consMatch) {
    result.cons = consMatch[1].trim()
    if (!prosMatch) {
      result.text = comment.replace(/\n❌ Недоліки:.+$/s, '').trim()
    }
  }

  return result
}

/** Повертає правильну форму слова "відгук" залежно від кількості */
function getReviewWord(count: number): string {
  if (count === 1) return 'відгук'
  if (count < 5) return 'відгуки'
  return 'відгуків'
}

/** Обчислює розподіл оцінок (від 5 до 1) */
function calcDistribution(reviews: Review[]): number[] {
  const dist = [0, 0, 0, 0, 0]
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++
  })
  return dist.reverse()
}

/** Сортує та фільтрує список відгуків */
function sortAndFilter(reviews: Review[], sortBy: SortOption, filterRating: number | null): Review[] {
  let result = [...reviews]

  if (filterRating !== null) {
    result = result.filter((r) => r.rating === filterRating)
  }

  const sorters: Record<SortOption, (a: Review, b: Review) => number> = {
    newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    oldest: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    highest: (a, b) => b.rating - a.rating,
    lowest: (a, b) => a.rating - b.rating,
    helpful: (a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0),
  }

  return result.sort(sorters[sortBy])
}

/* ─── Компонент ─── */

export default function ReviewSection({ productId, productRating }: ReviewSectionProps) {
  // Стан даних
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Фільтрація і сортування
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)

  // Форма відгуку
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewImages, setReviewImages] = useState<string[]>([])

  // Перевірка можливості залишити відгук
  const [canReview, setCanReview] = useState(false)
  const [reviewDenyReason, setReviewDenyReason] = useState<string | null>(null)

  const { isAuthenticated } = useAuthStore()

  // Обчислювані значення
  const distribution = calcDistribution(reviews)
  const sortedReviews = sortAndFilter(reviews, sortBy, filterRating)
  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, REVIEWS_PER_PAGE)
  const verifiedCount = reviews.filter((r) => r.isVerifiedPurchase).length
  const activeRating = hoverRating || rating

  /* ── API-запити ── */

  /** Завантажує відгуки для товару */
  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`)
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  /** Перевіряє чи користувач може написати відгук */
  const checkCanReview = async () => {
    if (!isAuthenticated) {
      setCanReview(false)
      setReviewDenyReason('not_authenticated')
      return
    }
    try {
      const { data } = await api.get(`/reviews/can-review/${productId}`)
      setCanReview(data.canReview)
      setReviewDenyReason(data.reason || null)
    } catch {
      setCanReview(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    checkCanReview()
  }, [productId, isAuthenticated])

  /* ── Обробники подій ── */

  /** Скидає форму до початкового стану */
  const resetForm = () => {
    setShowForm(false)
    setRating(5)
    setTitle('')
    setComment('')
    setPros('')
    setCons('')
    setReviewImages([])
  }

  /** Handles image file selection and converts to base64 */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (reviewImages.length + files.length > 3) {
      toast.error('Максимум 3 фотографії')
      return
    }

    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Файл ${file.name} занадто великий (макс. 2 МБ)`)
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setReviewImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    e.target.value = ''
  }

  /** Removes an image from the list */
  const removeReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index))
  }

  /** Надсилає новий відгук на сервер */
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('Увійдіть, щоб залишити відгук')
      return
    }
    if (!title.trim() || !comment.trim()) {
      toast.error('Заповніть всі поля')
      return
    }

    setSubmitting(true)
    try {
      const fullComment = [
        comment.trim(),
        pros.trim() ? `\n\n✅ Переваги: ${pros.trim()}` : '',
        cons.trim() ? `\n❌ Недоліки: ${cons.trim()}` : '',
      ].join('')

      await api.post('/reviews', {
        productId,
        rating,
        title: title.trim(),
        comment: fullComment,
        images: reviewImages.length > 0 ? reviewImages : undefined,
      })

      toast.success('Дякуємо за відгук!')
      resetForm()
      fetchReviews()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка при відправці відгуку')
    } finally {
      setSubmitting(false)
    }
  }

  /** Позначає відгук як корисний */
  const handleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Увійдіть, щоб оцінити відгук')
      return
    }
    try {
      await api.post(`/reviews/${reviewId}/helpful`)
      fetchReviews()
    } catch (error) {
      console.error('Error marking helpful:', error)
    }
  }

  /** Перемикає фільтр за оцінкою */
  const toggleRatingFilter = (star: number) => {
    setFilterRating((prev) => (prev === star ? null : star))
  }

  /* ── Рендер ── */

  return (
    <div className={s.container}>
      {/* Заголовок секції */}
      <div className={s.header}>
        <div className={s.headerTitle}>
          <MessageSquare className={s.headerIcon} />
          <h2 className={s.title}>Відгуки покупців</h2>
          {reviews.length > 0 && (
            <span className={s.reviewCount}>{reviews.length}</span>
          )}
        </div>

        {isAuthenticated && canReview && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className={`${s.writeReviewBtn} ${showForm ? s.writeReviewBtnActive : s.writeReviewBtnDefault}`}
          >
            {showForm ? 'Скасувати' : '✏️ Написати відгук'}
          </motion.button>
        )}
        {isAuthenticated && !canReview && reviewDenyReason === 'not_purchased' && (
          <span className={s.verifiedInfo} style={{ fontSize: '0.85rem' }}>
            <CheckCircle className={s.verifiedIcon} />
            Відгук можна залишити лише після отримання товару
          </span>
        )}
        {isAuthenticated && !canReview && reviewDenyReason === 'already_reviewed' && (
          <span className={s.verifiedInfo} style={{ fontSize: '0.85rem' }}>
            <CheckCircle className={s.verifiedIcon} />
            Ви вже залишили відгук
          </span>
        )}
      </div>

      {/* Блок загальної оцінки та розподілу */}
      <div className={s.ratingSummary}>
        {/* Загальна оцінка зліва */}
        <div className={s.overallScore}>
          <div className={`${s.scoreValue} ${getRatingColorClass(productRating.average)}`}>
            {productRating.average.toFixed(1)}
          </div>

          <div className={s.starsRow}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={i < Math.round(productRating.average) ? s.starFilled : s.starEmpty}
              />
            ))}
          </div>

          <div className={s.totalText}>
            {productRating.count} {getReviewWord(productRating.count)}
          </div>

          {verifiedCount > 0 && (
            <div className={s.verifiedInfo}>
              <CheckCircle className={s.verifiedIcon} />
              {verifiedCount} підтверджених покупок
            </div>
          )}
        </div>

        {/* Розподіл оцінок (бари) */}
        <div className={s.distribution}>
          {[5, 4, 3, 2, 1].map((star, index) => {
            const count = distribution[index]
            const pct = productRating.count > 0 ? (count / productRating.count) * 100 : 0
            const isActive = filterRating === star
            const barClass = star >= 4 ? s.barFillGreen : star === 3 ? s.barFillYellow : s.barFillRed

            return (
              <button
                key={star}
                onClick={() => toggleRatingFilter(star)}
                className={`${s.distributionBtn} ${isActive ? s.distributionBtnActive : s.distributionBtnDefault}`}
              >
                <div className={s.distributionLabel}>
                  <span className={s.distributionNumber}>{star}</span>
                  <Star className={s.distributionStar} />
                </div>

                <div className={s.distributionBar}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={barClass}
                  />
                </div>

                <span className={s.distributionCount}>
                  {count} ({pct.toFixed(0)}%)
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Індикатор активного фільтра */}
      {filterRating !== null && (
        <div className={s.filterIndicator}>
          <SlidersHorizontal className={s.filterIcon} />
          <span className={s.filterText}>
            Показано відгуки з оцінкою <strong>{filterRating}</strong> ({sortedReviews.length} з {reviews.length})
          </span>
          <button onClick={() => setFilterRating(null)} className={s.filterReset}>
            Скинути фільтр
          </button>
        </div>
      )}

      {/* Форма написання відгуку */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            onSubmit={handleSubmitReview}
            className={s.formWrapper}
          >
            <div className={s.formInner}>
              <h3 className={s.formTitle}>
                <Award className={s.formTitleIcon} />
                Ваш відгук
              </h3>

              {/* Вибір оцінки */}
              <div className={s.ratingField}>
                <label className={s.fieldLabel}>Оцінка *</label>
                <div className={s.ratingPicker}>
                  <div className={s.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={s.ratingStarBtn}
                      >
                        <Star
                          className={`${s.ratingStarIcon} ${
                            star <= activeRating ? s.ratingStarFilled : s.ratingStarEmpty
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className={`${s.ratingLabelText} ${getRatingColorClass(activeRating)}`}>
                    {RATING_LABELS[activeRating] || ''}
                  </span>
                </div>
              </div>

              {/* Заголовок */}
              <div className={s.inputField}>
                <label className={s.fieldLabel}>Заголовок *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Коротко опишіть ваші враження"
                  className={s.textInput}
                  maxLength={100}
                />
              </div>

              {/* Детальний коментар */}
              <div className={s.inputField}>
                <label className={s.fieldLabel}>Детальний відгук *</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Розкажіть детальніше про ваш досвід використання товару..."
                  rows={4}
                  className={s.textarea}
                  maxLength={1000}
                />
                <div className={s.charCount}>{comment.length}/1000</div>
              </div>

              {/* Переваги та недоліки */}
              <div className={s.prosConsGrid}>
                <div>
                  <label className={s.prosLabel}>✅ Переваги</label>
                  <textarea
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    placeholder="Що вам сподобалось?"
                    rows={3}
                    className={s.prosTextarea}
                    maxLength={300}
                  />
                </div>
                <div>
                  <label className={s.consLabel}>❌ Недоліки</label>
                  <textarea
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    placeholder="Що можна покращити?"
                    rows={3}
                    className={s.consTextarea}
                    maxLength={300}
                  />
                </div>
              </div>

              {/* Фотографії */}
              <div className={s.inputField}>
                <label className={s.fieldLabel}>Фотографії (до 3 шт.)</label>
                <div className={s.imageUploadArea}>
                  {reviewImages.map((img, i) => (
                    <div key={i} className={s.imagePreview}>
                      <Image src={img} alt="" width={80} height={80} className={s.imagePreviewImg} />
                      <button type="button" onClick={() => removeReviewImage(i)} className={s.imageRemoveBtn}>×</button>
                    </div>
                  ))}
                  {reviewImages.length < 3 && (
                    <label className={s.imageAddBtn}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className={s.hiddenInput}
                      />
                      <span className={s.imageAddIcon}>+</span>
                      <span className={s.imageAddText}>Додати фото</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Кнопки форми */}
              <div className={s.formActions}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className={s.submitBtn}
                >
                  {submitting ? 'Відправляємо...' : 'Опублікувати відгук'}
                </motion.button>
                <button type="button" onClick={resetForm} className={s.cancelBtn}>
                  Скасувати
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Панель сортування */}
      {reviews.length > 1 && (
        <div className={s.sortBar}>
          <div className={s.sortControls}>
            <SlidersHorizontal className={s.sortIcon} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={s.sortSelect}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <span className={s.sortCount}>{sortedReviews.length} відгуків</span>
        </div>
      )}

      {/* Список відгуків */}
      {loading ? (
        <LoadingSkeleton />
      ) : sortedReviews.length > 0 ? (
        <div className={s.reviewsList}>
          {displayedReviews.map((review, index) => (
            <ReviewCard
              key={review._id}
              review={review}
              index={index}
              onHelpful={handleHelpful}
            />
          ))}

          {/* Кнопка "Показати ще" */}
          {sortedReviews.length > REVIEWS_PER_PAGE && !showAllReviews && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowAllReviews(true)}
              className={s.showMoreBtn}
            >
              <ChevronDown className={s.showMoreIcon} />
              Показати ще {sortedReviews.length - REVIEWS_PER_PAGE} відгуків
            </motion.button>
          )}
        </div>
      ) : (
        <EmptyState
          isAuthenticated={isAuthenticated}
          onWriteReview={() => setShowForm(true)}
        />
      )}
    </div>
  )
}

/* ─── Підкомпоненти ─── */

/** Скелетон завантаження відгуків */
function LoadingSkeleton() {
  return (
    <div className={s.skeletonList}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={s.skeletonCard}>
          <div className={s.skeletonHeader}>
            <div className={s.skeletonAvatar} />
            <div>
              <div className={s.skeletonName} />
              <div className={s.skeletonDate} />
            </div>
          </div>
          <div className={s.skeletonTitle} />
          <div className={s.skeletonLine1} />
          <div className={s.skeletonLine2} />
        </div>
      ))}
    </div>
  )
}

/** Картка одного відгуку */
function ReviewCard({
  review,
  index,
  onHelpful,
}: {
  review: Review
  index: number
  onHelpful: (id: string) => void
}) {
  const parsed = parseReviewContent(review.comment)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={s.reviewCard}
    >
      {/* Автор відгуку */}
      <div className={s.reviewHeader}>
        <div className={s.reviewUser}>
          <div className={s.avatar}>
            {review.user.avatar ? (
              <Image src={review.user.avatar} alt="" width={40} height={40} className={s.avatarImg} />
            ) : (
              <span>{review.user.firstName[0]}{review.user.lastName[0]}</span>
            )}
          </div>

          <div>
            <div className={s.userInfo}>
              <span className={s.userName}>
                {review.user.firstName} {review.user.lastName}
              </span>
              {review.isVerifiedPurchase && (
                <span className={s.verifiedBadge}>
                  <CheckCircle className={s.verifiedBadgeIcon} />
                  Покупець
                </span>
              )}
            </div>

            <div className={s.reviewMeta}>
              <div className={s.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={i < review.rating ? s.reviewStarFilled : s.reviewStarEmpty}
                  />
                ))}
              </div>
              <span className={s.reviewTime}>{getTimeAgo(review.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Заголовок та текст */}
      {review.title && <h4 className={s.reviewTitle}>{review.title}</h4>}
      <p className={s.reviewText}>{parsed.text}</p>

      {/* Переваги / Недоліки */}
      {(parsed.pros || parsed.cons) && (
        <div className={s.reviewProsConsGrid}>
          {parsed.pros && (
            <div className={s.prosBlock}>
              <span className={s.prosEmoji}>👍</span>
              <div>
                <div className={s.prosTitle}>Переваги</div>
                <p className={s.prosText}>{parsed.pros}</p>
              </div>
            </div>
          )}
          {parsed.cons && (
            <div className={s.consBlock}>
              <span className={s.consEmoji}>👎</span>
              <div>
                <div className={s.consTitle}>Недоліки</div>
                <p className={s.consText}>{parsed.cons}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Фотографії відгуку */}
      {review.images && review.images.length > 0 && (
        <div className={s.reviewImages}>
          {review.images.map((img, i) => (
            <div key={i} className={s.reviewImageWrapper}>
              <Image src={img} alt={`Фото ${i + 1}`} width={120} height={120} className={s.reviewImage} />
            </div>
          ))}
        </div>
      )}

      {/* Кнопка "Корисно" та дата */}
      <div className={s.reviewActions}>
        <button onClick={() => onHelpful(review._id)} className={`${s.helpfulBtn} group`}>
          <ThumbsUp className={s.helpfulIcon} />
          <span>Корисно</span>
          {(review.helpfulVotes || 0) > 0 && (
            <span className={s.helpfulCount}>{review.helpfulVotes}</span>
          )}
        </button>
        <span className={s.reviewDate}>{formatDate(review.createdAt)}</span>
      </div>
    </motion.div>
  )
}

/** Пустий стан — коли відгуків ще немає */
function EmptyState({
  isAuthenticated,
  onWriteReview,
}: {
  isAuthenticated: boolean
  onWriteReview: () => void
}) {
  return (
    <div className={s.emptyState}>
      <div className={s.emptyIcon}>
        <MessageSquare className={s.emptyIconInner} />
      </div>
      <h3 className={s.emptyTitle}>Поки немає відгуків</h3>
      <p className={s.emptyText}>
        Станьте першим, хто поділиться своїми враженнями про цей товар
      </p>
      {isAuthenticated ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onWriteReview}
          className={s.emptyWriteBtn}
        >
          ✏️ Написати перший відгук
        </motion.button>
      ) : (
        <a href="/login" className={s.emptyLoginLink}>
          Увійдіть, щоб написати відгук
        </a>
      )}
    </div>
  )
}
