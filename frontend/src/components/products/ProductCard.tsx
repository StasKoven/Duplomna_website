'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, GitCompare } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useComparisonStore } from '@/store/comparisonStore'
import { toast } from 'sonner'

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
      toast.success('Видалено з порівняння')
    } else {
      const comparison = getComparisonByCategory(categoryId)
      if (comparison && comparison.products.length >= 4) {
        toast.error('Максимум 4 товари для порівняння')
        return
      }
      addToComparison(categoryId, categoryName, product)
      toast.success('Додано до порівняння')
    }
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="group relative rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-xl active:shadow-lg"
      >
        {/* ==================== */}
        {/* Product Badges Section */}
        {/* Бейджі товару: знижка, хіт продажів, наявність */}
        {/* Розташовані у лівому верхньому куті */}
        {/* ==================== */}
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10 flex flex-col gap-1">
          {product.isOnSale && product.discountPercentage && (
            <span className="rounded-full bg-destructive px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-destructive-foreground">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-full bg-primary px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-primary-foreground">
              ХІТ
            </span>
          )}
          {product.stock === 0 && (
            <span className="rounded-full bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold">
              Немає
            </span>
          )}
        </div>

        {/* ==================== */}
        {/* Action Buttons */}
        {/* Кнопки дій: додати в бажання, порівняння */}
        {/* Розташовані у правому верхньому куті */}
        {/* ==================== */}
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10 flex flex-col gap-1">
          <button
            onClick={handleToggleWishlist}
            className="rounded-full bg-background/80 p-1.5 sm:p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
          >
            <Heart
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
            />
          </button>
          <button
            onClick={handleToggleComparison}
            className="rounded-full bg-background/80 p-1.5 sm:p-2 backdrop-blur-sm transition-colors hover:bg-background active:scale-95"
          >
            <GitCompare
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isInComparison() ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </button>
        </div>

        {/* ==================== */}
        {/* Product Image */}
        {/* Зображення товару з ефектом збільшення при наведенні */}
        {/* Використовує Next.js Image для оптимізації */}
        {/* ==================== */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 50vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl sm:text-6xl">📱</div>
          )}
        </div>

        {/* ==================== */}
        {/* Product Content Section */}
        {/* Основна інформація про товар */}
        {/* ==================== */}
        <div className="p-2.5 sm:p-4">
          {/* Category Name - Назва категорії */}
          {product.category && !compact && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
              {typeof product.category === 'object' ? product.category.name : ''}
            </p>
          )}

          {/* Product Title - Назва товару, обмежена 2 рядками */}
          <h3 className={`font-semibold line-clamp-2 group-hover:text-primary transition-colors ${compact ? 'text-xs sm:text-sm mb-1' : 'text-sm sm:text-base mb-1.5 sm:mb-2'}`}>
            {product.name}
          </h3>

          {/* Product Rating - Рейтинг та кількість відгуків */}
          {product.rating.count > 0 && !compact && (
            <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium">{product.rating.average.toFixed(1)}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">({product.rating.count})</span>
            </div>
          )}

          {/* Product Price - Ціна та стара ціна (якщо є знижка) */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span className={`font-bold ${compact ? 'text-sm sm:text-base' : 'text-base sm:text-xl'}`}>
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] sm:text-sm text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button - Кнопка додавання до кошика */}
          {/* Неактивна якщо товар відсутній */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm'} font-medium`}
          >
            <ShoppingCart className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5 sm:h-4 sm:w-4'} />
            <span className={compact ? 'hidden xs:inline' : ''}>
              {product.stock === 0 ? 'Немає' : 'До кошика'}
            </span>
          </button>
        </div>
      </motion.div>
    </Link>
  )
}
