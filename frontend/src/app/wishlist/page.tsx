'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import s from './page.module.css'

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist, fetchWishlist, isLoading } = useWishlistStore()
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, fetchWishlist])

  const handleAddToCart = async (product: any) => {
    await addItem(product, 1)
  }

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId)
  }

  if (isLoading) {
    return (
      <div className={`container-custom ${s.loadingWrapper}`}>
        <div className={s.loadingContent}>
          <div className={s.spinner}></div>
          <p className={s.loadingText}>Завантаження списку бажань...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={`container-custom ${s.emptyWrapper}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.emptyContent}
        >
          <Heart className={s.emptyIcon} />
          <h1 className={s.emptyTitle}>Увійдіть до аккаунту</h1>
          <p className={s.emptyText}>
            Щоб переглядати список бажань, увійдіть або зареєструйтесь
          </p>
          <Link
            href="/login?redirect=/wishlist"
            className={s.catalogLink}
          >
            Увійти
          </Link>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={`container-custom ${s.emptyWrapper}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.emptyContent}
        >
          <Heart className={s.emptyIcon} />
          <h1 className={s.emptyTitle}>Список бажань порожній</h1>
          <p className={s.emptyText}>
            Додавайте улюблені товари до списку бажань, щоб не втратити їх
          </p>
          <Link
            href="/products"
            className={s.catalogLink}
          >
            Перейти до каталогу
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.headerWrapper}>
        <div>
          <h1 className={s.title}>Список бажань</h1>
          <p className={s.subtitle}>
            У вас {items.length} {items.length === 1 ? 'товар' : (items.length >= 2 && items.length <= 4) ? 'товари' : 'товарів'} у списку бажань
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Ви впевнені, що хочете очистити весь список бажань?')) {
                clearWishlist()
              }
            }}
            className={s.clearBtn}
          >
            Очистити все
          </button>
        )}
      </div>

      <div className={s.gridLayout}>
        <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`group ${s.card}`}
          >
            <div className={s.imageWrapper}>
              {item.images && item.images[0]?.url ? (
                <Image
                  src={item.images[0].url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={s.image}
                />
              ) : (
                <div className={s.imagePlaceholder}>
                  📱
                </div>
              )}
              <button
                onClick={() => handleRemove(item._id)}
                className={s.removeBtn}
              >
                <X className={s.removeIcon} />
              </button>
            </div>

            <div className={s.cardContent}>
              <Link
                href={`/products/${item.slug}`}
                className={s.productLink}
              >
                {item.name}
              </Link>

              <div className={s.priceRow}>
                <span className={s.price}>{item.price.toLocaleString('uk-UA')} ₴</span>
                {item.comparePrice && item.comparePrice > item.price && (
                  <span className={s.comparePrice}>
                    {item.comparePrice.toLocaleString('uk-UA')} ₴
                  </span>
                )}
              </div>

              <div className={s.stockRow}>
                {item.stock > 0 ? (
                  <span className={s.inStock}>В наявності</span>
                ) : (
                  <span className={s.outOfStock}>Немає в наявності</span>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(item)}
                disabled={item.stock === 0}
                className={`btn-primary ${s.addToCartBtn}`}
              >
                <ShoppingCart className={s.cartIcon} />
                Додати до кошика
              </button>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
