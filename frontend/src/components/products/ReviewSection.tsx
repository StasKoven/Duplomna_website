'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, ThumbsDown, User, CheckCircle, MessageSquare, SlidersHorizontal, ChevronDown, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'

export default function ReviewSection({ productId, productRating }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  
  // Form state
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
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
      const fullComment = [
        comment.trim(),
        pros.trim() ? `\n\n✅ Переваги: ${pros.trim()}` : '',
        cons.trim() ? `\n❌ Недоліки: ${cons.trim()}` : ''
      ].join('')

      await api.post('/reviews', {
        productId,
        rating,
        title: title.trim(),
        comment: fullComment
      })
      
      toast.success('Дякуємо за відгук!')
      setShowForm(false)
      setRating(5)
      setTitle('')
      setComment('')
      setPros('')
      setCons('')
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сьогодні'
    if (diffDays === 1) return 'Вчора'
    if (diffDays < 7) return `${diffDays} дн. тому`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} тиж. тому`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} міс. тому`
    return `${Math.floor(diffDays / 365)} р. тому`
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

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Жахливо'
      case 2: return 'Погано'
      case 3: return 'Нормально'
      case 4: return 'Добре'
      case 5: return 'Відмінно'
      default: return ''
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-green-500'
    if (rating >= 2.5) return 'text-yellow-500'
    if (rating >= 1.5) return 'text-orange-500'
    return 'text-red-500'
  }

  const getSortedAndFilteredReviews = () => {
    let filtered = [...reviews]
    
    // Filter by rating
    if (filterRating !== null) {
      filtered = filtered.filter(r => r.rating === filterRating)
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case 'helpful':
        filtered.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0))
        break
    }
    
    return filtered
  }

  const ratingDistribution = getRatingDistribution()
  const sortedReviews = getSortedAndFilteredReviews()
  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 5)
  const verifiedCount = reviews.filter(r => r.isVerifiedPurchase).length

  // Parse pros/cons from comment
  const parseReviewContent = (comment: string) => {
    const parts = { text: comment, pros: '', cons: '' }
    
    const prosMatch = comment.match(/✅ Переваги: (.+?)(?=\n❌|$)/s)
    const consMatch = comment.match(/❌ Недоліки: (.+?)$/s)
    
    if (prosMatch) {
      parts.pros = prosMatch[1].trim()
      parts.text = comment.replace(/\n\n✅ Переваги:.+$/s, '').trim()
    }
    if (consMatch) {
      parts.cons = consMatch[1].trim()
      if (!prosMatch) {
        parts.text = comment.replace(/\n❌ Недоліки:.+$/s, '').trim()
      }
    }
    
    return parts
  }

  return (
    <div className="mt-8 sm:mt-12 border-t pt-8 sm:pt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Відгуки покупців</h2>
          {reviews.length > 0 && (
            <span className="bg-primary/10 text-primary text-sm font-medium px-2.5 py-0.5 rounded-full">
              {reviews.length}
            </span>
          )}
        </div>
        
        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              showForm 
                ? 'bg-muted text-foreground hover:bg-muted/80' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
            }`}
          >
            {showForm ? 'Скасувати' : '✏️ Написати відгук'}
          </motion.button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="grid md:grid-cols-[280px_1fr] gap-6 sm:gap-8 mb-8 p-4 sm:p-6 bg-muted/30 rounded-xl border">
        {/* Left: Overall score */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`text-5xl sm:text-6xl font-bold ${getRatingColor(productRating.average)}`}>
            {productRating.average.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-0.5 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  i < Math.round(productRating.average)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {productRating.count} {productRating.count === 1 ? 'відгук' : productRating.count < 5 ? 'відгуки' : 'відгуків'}
          </div>
          {verifiedCount > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              {verifiedCount} підтверджених покупок
            </div>
          )}
        </div>
        
        {/* Right: Distribution bars */}
        <div className="flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((star, index) => {
            const count = ratingDistribution[index]
            const percentage = productRating.count > 0 ? (count / productRating.count) * 100 : 0
            const isActive = filterRating === star
            
            return (
              <button
                key={star}
                onClick={() => setFilterRating(isActive ? null : star)}
                className={`flex items-center gap-3 py-1.5 px-2 rounded-lg transition-all ${
                  isActive ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-1.5 w-16">
                  <span className="text-sm font-medium w-3">{star}</span>
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active filter indicator */}
      {filterRating !== null && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm">
            Показано відгуки з оцінкою <strong>{filterRating}</strong> ({sortedReviews.length} з {reviews.length})
          </span>
          <button
            onClick={() => setFilterRating(null)}
            className="ml-auto text-xs text-primary hover:underline font-medium"
          >
            Скинути фільтр
          </button>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            onSubmit={handleSubmitReview}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 border-2 border-primary/20 rounded-xl bg-gradient-to-b from-primary/5 to-transparent">
              <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Ваш відгук
              </h3>
              
              {/* Rating Selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">Оцінка *</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${getRatingColor(hoverRating || rating)}`}>
                    {getRatingLabel(hoverRating || rating)}
                  </span>
                </div>
              </div>
              
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Заголовок *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Коротко опишіть ваші враження"
                  className="w-full px-4 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  maxLength={100}
                />
              </div>
              
              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Детальний відгук *</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Розкажіть детальніше про ваш досвід використання товару..."
                  rows={4}
                  className="w-full px-4 py-2.5 border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  maxLength={1000}
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">{comment.length}/1000</div>
              </div>

              {/* Pros & Cons */}
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-green-600">✅ Переваги</label>
                  <textarea
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    placeholder="Що вам сподобалось?"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-green-200 rounded-lg bg-green-50/50 dark:bg-green-950/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                    maxLength={300}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-red-500">❌ Недоліки</label>
                  <textarea
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    placeholder="Що можна покращити?"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                    maxLength={300}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 shadow-md"
                >
                  {submitting ? 'Відправляємо...' : 'Опублікувати відгук'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Sort controls */}
      {reviews.length > 1 && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm bg-transparent border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="newest">Спочатку нові</option>
              <option value="oldest">Спочатку старі</option>
              <option value="highest">Висока оцінка</option>
              <option value="lowest">Низька оцінка</option>
              <option value="helpful">Найкорисніші</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground">
            {sortedReviews.length} відгуків
          </span>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5 border rounded-xl animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div>
                  <div className="h-4 bg-muted rounded w-28 mb-1.5" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1.5" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : sortedReviews.length > 0 ? (
        <div className="space-y-4">
          {displayedReviews.map((review, index) => {
            const parsed = parseReviewContent(review.comment)
            
            return (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 sm:p-6 border rounded-xl hover:border-primary/20 hover:shadow-sm transition-all"
              >
                {/* Review header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-sm">
                      {review.user.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{review.user.firstName[0]}{review.user.lastName[0]}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {review.user.firstName} {review.user.lastName}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Покупець
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Title */}
                {review.title && (
                  <h4 className="font-semibold mb-2 text-[15px]">{review.title}</h4>
                )}
                
                {/* Comment text */}
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">{parsed.text}</p>
                
                {/* Pros & Cons */}
                {(parsed.pros || parsed.cons) && (
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    {parsed.pros && (
                      <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">👍</span>
                        <div>
                          <div className="text-xs font-semibold text-green-600 mb-1">Переваги</div>
                          <p className="text-sm text-green-800 dark:text-green-300">{parsed.pros}</p>
                        </div>
                      </div>
                    )}
                    {parsed.cons && (
                      <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">👎</span>
                        <div>
                          <div className="text-xs font-semibold text-red-500 mb-1">Недоліки</div>
                          <p className="text-sm text-red-800 dark:text-red-300">{parsed.cons}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-dashed">
                  <button
                    onClick={() => handleHelpful(review._id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span>Корисно</span>
                    {(review.helpfulVotes || 0) > 0 && (
                      <span className="bg-muted px-1.5 py-0.5 rounded-full text-[11px] font-medium">
                        {review.helpfulVotes}
                      </span>
                    )}
                  </button>
                  <span className="text-xs text-muted-foreground/50">{formatDate(review.createdAt)}</span>
                </div>
              </motion.div>
            )
          })}
          
          {/* Show more button */}
          {sortedReviews.length > 5 && !showAllReviews && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowAllReviews(true)}
              className="w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center justify-center gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Показати ще {sortedReviews.length - 5} відгуків
            </motion.button>
          )}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Поки немає відгуків</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Станьте першим, хто поділиться своїми враженнями про цей товар
          </p>
          {isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 shadow-md"
            >
              ✏️ Написати перший відгук
            </motion.button>
          ) : (
            <a href="/login" className="text-sm text-primary hover:underline font-medium">
              Увійдіть, щоб написати відгук
            </a>
          )}
        </div>
      )}
    </div>
  )
}
