'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Truck, Shield, Package, GitCompare } from 'lucide-react'
import api from '@/lib/api'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useComparisonStore } from '@/store/comparisonStore'
import { toast } from 'sonner'
import ReviewSection from '@/components/products/ReviewSection'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCartStore()
  const { addToWishlist, isInWishlist } = useWishlistStore()
  const { addToComparison, removeFromComparison, getComparisonByCategory } = useComparisonStore()

  const getCategoryId = () => {
    if (product?.category && typeof product.category === 'object') {
      return product.category._id
    }
    return ''
  }

  const getCategoryName = () => {
    if (product?.category && typeof product.category === 'object') {
      return product.category.name
    }
    return ''
  }

  const isInComparison = () => {
    const categoryId = getCategoryId()
    if (!categoryId || !product) return false
    const comparison = getComparisonByCategory(categoryId)
    return comparison?.products.some(p => p._id === product._id) || false
  }

  const handleToggleComparison = () => {
    if (!product) return
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

  useEffect(() => {
    if (params.slug) {
      fetchProduct()
    }
  }, [params.slug])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${params.slug}`)
      setProduct(response.data.product)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Товар не знайдено')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addItem(product)
    }
  }

  const handleAddToWishlist = async () => {
    if (product) {
      await addToWishlist(product)
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-4 sm:py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-6 sm:h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-10 sm:h-12 bg-muted rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-custom py-4 sm:py-8">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Товар не знайдено</h1>
          <a href="/products" className="text-primary hover:underline">
            Повернутися до каталогу
          </a>
        </div>
      </div>
    )
  }

  const mainImage = product.images[selectedImage]?.url || product.images[0]?.url

  return (
    <div className="container-custom py-4 sm:py-8">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
        {/* Images */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square bg-muted rounded-lg overflow-hidden mb-3 sm:mb-4"
          >
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-5xl sm:text-6xl">
                📱
              </div>
            )}
          </motion.div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            {product.category && typeof product.category === 'object' && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                {product.category.name}
              </p>
            )}
            <h1 className="text-xl sm:text-3xl font-bold mb-2">{product.name}</h1>
            
            {product.rating.count > 0 && (
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        i < Math.round(product.rating.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {product.rating.average.toFixed(1)} ({product.rating.count} відгуків)
                </span>
              </div>
            )}
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
              <span className="text-2xl sm:text-4xl font-bold">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-base sm:text-xl text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-destructive">
                    -{product.discountPercentage}%
                  </span>
                </>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground">
              {product.stock > 0 ? (
                <span className="text-green-600">✓ В наявності</span>
              ) : (
                <span className="text-red-600">Немає в наявності</span>
              )}
            </p>
          </div>

          <div className="space-y-3 mb-4 sm:mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full rounded-md bg-primary px-6 sm:px-8 py-2.5 sm:py-3 text-white text-sm sm:text-base font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {product.stock === 0 ? 'Немає в наявності' : 'Додати до кошика'}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleAddToWishlist}
                className={`rounded-md border px-4 py-2.5 sm:py-3 text-sm font-medium hover:bg-accent flex items-center justify-center gap-2 ${
                  isInWishlist(product._id) ? 'border-red-500 text-red-500' : ''
                }`}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isInWishlist(product._id) ? 'У бажаннях' : 'До бажань'}</span>
                <span className="sm:hidden">{isInWishlist(product._id) ? '✓' : ''}</span>
              </button>

              <button 
                onClick={handleToggleComparison}
                className={`rounded-md border px-4 py-2.5 sm:py-3 text-sm font-medium hover:bg-accent flex items-center justify-center gap-2 ${
                  isInComparison() ? 'border-primary text-primary' : ''
                }`}
              >
                <GitCompare className={`h-4 w-4 sm:h-5 sm:w-5`} />
                <span className="hidden sm:inline">{isInComparison() ? 'Порівнюється' : 'Порівняти'}</span>
                <span className="sm:hidden">{isInComparison() ? '✓' : ''}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 py-4 sm:py-6 border-t">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span>Безкоштовна доставка від 1000 грн</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span>Офіційна гарантія {product.warranty || '1 рік'}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span>Доставка 1-3 дні</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Опис</h2>
          <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line">
            {product.description}
          </p>

          {product.features && product.features.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h3 className="font-semibold mb-2 sm:mb-3">Особливості:</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Характеристики</h2>
            <div className="space-y-1.5 sm:space-y-2">
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between py-1.5 sm:py-2 border-b text-xs sm:text-sm"
                >
                  <span className="font-medium">{spec.name}</span>
                  <span className="text-muted-foreground text-right ml-4">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={product._id} productRating={product.rating} />
    </div>
  )
}
