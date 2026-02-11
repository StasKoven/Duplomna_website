'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, User, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

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
  isVerifiedPurchase: boolean
  helpfulVotes: number
  createdAt: string
}

interface ReviewSectionProps {
  productId: string
  productRating: {
    average: number
    count: number
  }
}

export default function ReviewSection({ productId, productRating }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  
  // Form state
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}`)
      setReviews(response.data.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

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
      await api.post('/reviews', {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim()
      })
      
      toast.success('Дякуємо за відгук!')
      setShowForm(false)
      setRating(5)
      setTitle('')
      setComment('')
      fetchReviews()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка при відправці відгуку')
    } finally {
      setSubmitting(false)
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++
      }
    })
    return distribution.reverse() // 5 to 1
  }

  const ratingDistribution = getRatingDistribution()

  return (
    <div className="mt-8 sm:mt-12 border-t pt-8 sm:pt-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold">Відгуки покупців</h2>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            {showForm ? 'Скасувати' : 'Написати відгук'}
          </button>
        )}
      </div>

      {/* ==================== */}
      {/* Rating Summary Section */}
      {/* Загальний рейтинг та розподіл оцінок */}
      {/* Показує середню оцінку та графік розподілу */}
      {/* ==================== */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold">{productRating.average.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 my-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    i < Math.round(productRating.average)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{productRating.count} відгуків</div>
          </div>
          
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star, index) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-3">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${productRating.count > 0 ? (ratingDistribution[index] / productRating.count) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">{ratingDistribution[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== */}
      {/* Review Form Section */}
      {/* Форма для написання нового відгуку */}
      {/* Доступна тільки авторизованим користувачам */}
      {/* ==================== */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 p-4 sm:p-6 border rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-4">Ваш відгук</h3>
          
          {/* Rating Selection - Вибір оцінки від 1 до 5 зірок */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Оцінка</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-6 w-6 sm:h-8 sm:w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating === 1 && 'Жахливо'}
                {rating === 2 && 'Погано'}
                {rating === 3 && 'Нормально'}
                {rating === 4 && 'Добре'}
                {rating === 5 && 'Відмінно'}
              </span>
            </div>
          </div>
          
          {/* Review Title Input - Заголовок відгуку (макс. 100 символів) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Коротко опишіть ваші враження"
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              maxLength={100}
            />
          </div>
          
          {/* Review Comment Textarea - Текст відгуку (макс. 1000 символів) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Відгук</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Розкажіть детальніше про ваш досвід використання товару"
              rows={4}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground mt-1">{comment.length}/1000</div>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Відправляємо...' : 'Відправити відгук'}
          </button>
        </form>
      )}

      {/* ==================== */}
      {/* Reviews List Section */}
      {/* Список відгуків користувачів */}
      {/* Показує skeleton при завантаженні */}
      {/* ==================== */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="p-4 sm:p-6 border rounded-lg">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {review.user.firstName} {review.user.lastName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(review.createdAt)}</span>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Перевірена покупка
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-semibold mb-2">{review.title}</h4>
              )}
              
              <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>
              
              <button
                onClick={() => handleHelpful(review._id)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Корисно ({review.helpfulVotes || 0})
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="font-semibold mb-2">Поки немає відгуків</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Станьте першим, хто залишить відгук про цей товар
          </p>
          {!isAuthenticated && (
            <a href="/login" className="text-sm text-primary hover:underline">
              Увійдіть, щоб написати відгук
            </a>
          )}
        </div>
      )}
    </div>
  )
}
