'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Truck, Shield, Package, GitCompare, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useComparisonStore } from '@/store/comparisonStore'
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore'
import { toast } from 'sonner'
import ReviewSection from '@/components/products/ReviewSection'
import s from './page.module.css'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const getCachedProduct = (): Product | null => {
    try {
      const raw = sessionStorage.getItem(`product_${slug}`)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  const cached = typeof window !== 'undefined' ? getCachedProduct() : null
  const [product, setProduct] = useState<Product | null>(cached)
  const [loading, setLoading] = useState(!cached)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCartStore()
  const { addToWishlist, isInWishlist } = useWishlistStore()
  const { addToComparison, removeFromComparison, getComparisonByCategory } = useComparisonStore()
  const { addProduct: addToRecentlyViewed } = useRecentlyViewedStore()

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
    } else {
      const comparison = getComparisonByCategory(categoryId)
      if (comparison && comparison.products.length >= 4) {
        toast.error('Максимум 4 товари для порівняння')
        return
      }
      addToComparison(categoryId, categoryName, product)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  useEffect(() => {
    if (product) {
      document.title = `${product.name} — купити в TechStore`
      addToRecentlyViewed(product)
    }
    return () => {
      document.title = 'TechStore — Інтернет-магазин електроніки'
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      if (!product) setLoading(true)
      const response = await api.get(`/products/${slug}`)
      const data: Product = response.data.product
      setProduct(data)
      try { sessionStorage.setItem(`product_${slug}`, JSON.stringify(data)) } catch {}
    } catch (error) {
      console.error('Error fetching product:', error)
      if (!product) toast.error('Товар не знайдено')
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
      <div className={`container-custom ${s.pageContainer}`}>
        <div className={s.skeleton}>
          <div className={s.skeletonGrid}>
            <div className={s.skeletonImage} />
            <div className={s.skeletonInfo}>
              <div className={s.skeletonTitle} />
              <div className={s.skeletonRating} />
              <div className={s.skeletonPrice} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={`container-custom ${s.pageContainer}`}>
        <div className={s.notFound}>
          <h1 className={s.notFoundTitle}>Товар не знайдено</h1>
          <a href="/products" className={s.notFoundLink}>
            Повернутися до каталогу
          </a>
        </div>
      </div>
    )
  }

  const mainImage = product.images[selectedImage]?.url || product.images[0]?.url

  return (
    <div className={`container-custom ${s.pageContainer}`}>
      <div className={s.mainGrid}>
        {/* Images */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`group ${s.mainImageWrapper}`}
          >
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                width={600}
                height={600}
                className={s.mainImage}
              />
            ) : (
              <div className={s.imagePlaceholder}>
                📱
              </div>
            )}

            {/* Main image navigation arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : product.images.length - 1)}
                  className={`${s.imageNavBtn} ${s.imageNavLeft}`}
                >
                  <ChevronLeft className={s.iconMd} />
                </button>
                <button
                  onClick={() => setSelectedImage(selectedImage < product.images.length - 1 ? selectedImage + 1 : 0)}
                  className={`${s.imageNavBtn} ${s.imageNavRight}`}
                >
                  <ChevronRight className={s.iconMd} />
                </button>
                <div className={s.imageCounter}>
                  {selectedImage + 1} / {product.images.length}
                </div>
              </>
            )}
          </motion.div>

          {product.images.length > 1 && (
            <div className={s.thumbnailsWrapper}>
              {/* Left scroll arrow */}
              {product.images.length > 5 && (
                <button
                  onClick={() => {
                    const container = document.getElementById('image-thumbnails')
                    if (container) container.scrollBy({ left: -110, behavior: 'smooth' })
                  }}
                  className={`${s.thumbnailScrollBtn} ${s.thumbnailScrollLeft}`}
                >
                  <ChevronLeft className={s.iconSm} />
                </button>
              )}

              <div
                id="image-thumbnails"
                className={s.thumbnailsList}
              >
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`${s.thumbnailBtn} ${
                      selectedImage === index ? s.thumbnailActive : s.thumbnailInactive
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className={s.thumbnailImage}
                    />
                  </button>
                ))}
              </div>

              {/* Right scroll arrow */}
              {product.images.length > 5 && (
                <button
                  onClick={() => {
                    const container = document.getElementById('image-thumbnails')
                    if (container) container.scrollBy({ left: 110, behavior: 'smooth' })
                  }}
                  className={`${s.thumbnailScrollBtn} ${s.thumbnailScrollRight}`}
                >
                  <ChevronRight className={s.iconSm} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className={s.productInfoSection}>
            {product.category && typeof product.category === 'object' && (
              <p className={s.categoryLabel}>
                {product.category.name}
              </p>
            )}
            <h1 className={s.productTitle}>{product.name}</h1>
            
            {product.rating.count > 0 && (
              <div className={s.ratingWrapper}>
                <div className={s.starsWrapper}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={i < Math.round(product.rating.average) ? s.starFilled : s.starEmpty}
                    />
                  ))}
                </div>
                <span className={s.ratingText}>
                  {product.rating.average.toFixed(1)} ({product.rating.count} відгуків)
                </span>
              </div>
            )}
          </div>

          <div className={s.priceSection}>
            <div className={s.priceRow}>
              <span className={s.currentPrice}>{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className={s.oldPrice}>
                    {formatPrice(product.comparePrice)}
                  </span>
                  <span className={s.discountBadge}>
                    -{product.discountPercentage}%
                  </span>
                </>
              )}
            </div>
            
            <p className={s.stockInfo}>
              {product.stock > 0 ? (
                <span className={s.inStock}>✓ В наявності</span>
              ) : (
                <span className={s.outOfStock}>Немає в наявності</span>
              )}
            </p>
          </div>

          <div className={s.actionsSection}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={s.addToCartBtn}
            >
              <ShoppingCart className={s.actionIcon} />
              {product.stock === 0 ? 'Немає в наявності' : 'Додати до кошика'}
            </button>

            <div className={s.actionButtonsGrid}>
              <button 
                onClick={handleAddToWishlist}
                className={`${s.actionBtn} ${
                  isInWishlist(product._id) ? s.wishlistActive : ''
                }`}
              >
                <Heart className={`${s.actionIcon} ${isInWishlist(product._id) ? s.iconFilled : ''}`} />
                <span className={s.hiddenMobile}>{isInWishlist(product._id) ? 'У бажаннях' : 'До бажань'}</span>
                <span className={s.hiddenDesktop}>{isInWishlist(product._id) ? '✓' : ''}</span>
              </button>

              <button 
                onClick={handleToggleComparison}
                className={`${s.actionBtn} ${
                  isInComparison() ? s.comparisonActive : ''
                }`}
              >
                <GitCompare className={s.actionIcon} />
                <span className={s.hiddenMobile}>{isInComparison() ? 'Порівнюється' : 'Порівняти'}</span>
                <span className={s.hiddenDesktop}>{isInComparison() ? '✓' : ''}</span>
              </button>
            </div>
          </div>

          <div className={s.deliveryInfo}>
            <div className={s.deliveryItem}>
              <Truck className={s.deliveryIcon} />
              <span>Безкоштовна доставка від 1000 грн</span>
            </div>
            <div className={s.deliveryItem}>
              <Shield className={s.deliveryIcon} />
              <span>Офіційна гарантія {product.warranty || '1 рік'}</span>
            </div>
            <div className={s.deliveryItem}>
              <Package className={s.deliveryIcon} />
              <span>Доставка 1-3 дні</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <div className={s.descriptionGrid}>
        <div>
          <h2 className={s.sectionTitle}>Опис</h2>
          <p className={s.descriptionText}>
            {product.description}
          </p>

          {product.features && product.features.length > 0 && (
            <div className={s.featuresWrapper}>
              <h3 className={s.featuresSubtitle}>Особливості:</h3>
              <ul className={s.featuresList}>
                {product.features.map((feature, index) => (
                  <li key={index} className={s.featureItem}>
                    <span className={s.featureCheck}>✓</span>
                    <span className={s.featureText}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h2 className={s.sectionTitle}>Характеристики</h2>
            <div className={s.specsList}>
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  className={s.specRow}
                >
                  <span className={s.specName}>{spec.name}</span>
                  <span className={s.specValue}>{spec.value}</span>
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
