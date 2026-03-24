'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, ArrowLeftRight } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useComparisonStore } from '@/store/comparisonStore'
import { toast } from 'sonner'
import s from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
  compact?: boolean // For mobile grid view
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { addToComparison, removeFromComparison, getComparisonByCategory } = useComparisonStore()
  
  const isWishlisted = isInWishlist(product._id)

  const getCategoryId = () => {
    if (product.category && typeof product.category === 'object') {
      return product.category._id
    }
    return ''
  }

  const getCategoryName = () => {
    if (product.category && typeof product.category === 'object') {
      return product.category.name
    }
    return ''
  }

  const isInComparison = () => {
    const categoryId = getCategoryId()
    if (!categoryId) return false
    const comparison = getComparisonByCategory(categoryId)
    return comparison?.products.some(p => p._id === product._id) || false
  }

  const mainImage = product.images.find(img => img.isMain)?.url || product.images[0]?.url

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    addItem(product)
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isWishlisted) {
      await removeFromWishlist(product._id)
    } else {
      await addToWishlist(product)
    }
  }

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const categoryId = getCategoryId()
    const categoryName = getCategoryName()
    
    if (!categoryId) {
      toast.error('Категорія не визначена')
      return
    }

    if (isInComparison()) {
      removeFromComparison(categoryId, product._id)
    } else {
      const comparison = getComparisonByCategory(categoryId)
      if (comparison && comparison.products.length >= 4) {
        toast.error('Максимум 4 товари для порівняння')
        return
      }
      addToComparison(categoryId, categoryName, product)
    }
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`group ${s.card}`}
      >
        {/* Бейджі товару */}
        <div className={s.badgesContainer}>
          {product.isOnSale && product.discountPercentage && (
            <span className={s.badgeDiscount}>
              -{product.discountPercentage}%
            </span>
          )}
          {product.isFeatured && (
            <span className={s.badgeFeatured}>
              ХІТ
            </span>
          )}
          {product.stock === 0 && (
            <span className={s.badgeOutOfStock}>
              Немає
            </span>
          )}
        </div>

        {/* Кнопки дій: бажання, порівняння */}
        <div className={s.actionsContainer}>
          <button
            onClick={handleToggleWishlist}
            className={s.actionButton}
          >
            <Heart
              className={isWishlisted ? s.heartIconActive : s.heartIcon}
            />
          </button>
          <button
            onClick={handleToggleComparison}
            className={s.actionButton}
          >
            <ArrowLeftRight
              className={isInComparison() ? s.compareIconActive : s.compareIcon}
            />
          </button>
        </div>

        {/* Зображення товару */}
        <div className={s.imageWrapper}>
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 50vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={s.image}
            />
          ) : (
            <div className={s.imagePlaceholder}>📱</div>
          )}
        </div>

        {/* Основна інформація про товар */}
        <div className={s.content}>
          {/* Назва категорії */}
          {product.category && !compact && (
            <p className={s.categoryName}>
              {typeof product.category === 'object' ? product.category.name : ''}
            </p>
          )}

          {/* Назва товару */}
          <h3 className={compact ? s.titleCompact : s.title}>
            {product.name}
          </h3>

          {/* Рейтинг та відгуки */}
          {product.rating.count > 0 && !compact && (
            <div className={s.ratingContainer}>
              <Star className={s.starIcon} />
              <span className={s.ratingValue}>{product.rating.average.toFixed(1)}</span>
              <span className={s.ratingCount}>({product.rating.count})</span>
            </div>
          )}

          {/* Ціна товару */}
          <div className={s.priceContainer}>
            <span className={compact ? s.priceCompact : s.price}>
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className={s.comparePrice}>
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Кнопка "Додати до кошика" */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={compact ? s.addToCartButtonCompact : s.addToCartButton}
          >
            <ShoppingCart className={compact ? s.cartIconCompact : s.cartIcon} />
            <span className={compact ? s.cartTextCompact : undefined}>
              {product.stock === 0 ? 'Немає' : 'До кошика'}
            </span>
          </button>
        </div>
      </motion.div>
    </Link>
  )
}
