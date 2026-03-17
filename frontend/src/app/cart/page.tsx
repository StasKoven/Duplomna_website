'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, X, LogIn, UserPlus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'
import s from './page.module.css'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice, fetchCart, isLoading } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])
  
  const itemCount = getTotalItems()
  const total = getTotalPrice()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
    } else {
      router.push('/checkout')
    }
  }

  /* Стан завантаження */
  if (isLoading) {
    return (
      <div className={`container-custom ${s.loadingPage}`}>
        <div className={s.loadingWrapper}>
          <div className={s.spinner}></div>
          <p className={s.loadingText}>Завантаження кошика...</p>
        </div>
      </div>
    )
  }

  /* Порожній кошик */
  if (items.length === 0) {
    return (
      <div className={`container-custom ${s.emptyPage}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.emptyWrapper}
        >
          <ShoppingBag className={s.emptyIcon} />
          <h1 className={s.emptyTitle}>Ваш кошик порожній</h1>
          <p className={s.emptyDescription}>
            Додайте товари до кошика, щоб продовжити покупки
          </p>
          <Link href="/products" className={s.emptyLink}>
            Перейти до покупок
            <ArrowRight className={s.emptyLinkIcon} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {/* Модальне вікно авторизації */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={s.modalOverlay}
              onClick={() => setShowAuthModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={s.modalContent}
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className={s.modalCloseBtn}
              >
                <X className={s.modalCloseIcon} />
              </button>
              
              <div className={s.modalHeader}>
                <div className={s.modalIconWrapper}>
                  <ShoppingBag className={s.modalIcon} />
                </div>
                <h3 className={s.modalTitle}>Оформлення замовлення</h3>
                <p className={s.modalDescription}>
                  Для оформлення замовлення потрібно увійти в акаунт або зареєструватися
                </p>
              </div>

              <div className={s.modalActions}>
                <Link
                  href="/login?redirect=/checkout"
                  className={s.modalLoginBtn}
                >
                  <LogIn className={s.modalBtnIcon} />
                  Увійти
                </Link>
                <Link
                  href="/register?redirect=/checkout"
                  className={s.modalRegisterBtn}
                >
                  <UserPlus className={s.modalBtnIcon} />
                  Зареєструватися
                </Link>
              </div>

              <p className={s.modalFooter}>
                Ваш кошик збережеться після входу
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Основна частина кошика */}
      <div className={`container-custom ${s.pageWrapper}`}>
        <h1 className={s.pageTitle}>Кошик ({itemCount})</h1>

        <div className={s.gridLayout}>
          {/* Список товарів */}
          <div className={s.itemsColumn}>
            <AnimatePresence>
            {items.map((item) => {
              const product = item.product as Product
              return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={s.cartCard}
              >
                {/* Мобільний макет */}
                <div className={s.mobileLayout}>
                <div className={s.mobileImageWrapper}>
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className={s.objectCover}
                    />
                  ) : (
                    <div className={s.mobilePlaceholder}>
                      📱
                    </div>
                  )}
                </div>
                <div className={s.mobileInfo}>
                  <Link
                    href={`/products/${product.slug}`}
                    className={s.mobileProductLink}
                  >
                    {product.name}
                  </Link>
                  <div className={s.mobilePrice}>
                    {formatPrice(product.price * item.quantity)}
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className={s.mobileComparePrice}>
                      {formatPrice(product.comparePrice * item.quantity)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Мобільні елементи керування */}
              <div className={s.mobileControls}>
                <div className={s.mobileQuantityGroup}>
                  <button
                    onClick={() =>
                      updateQuantity(product._id, Math.max(1, item.quantity - 1))
                    }
                    className={s.mobileQuantityBtn}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className={s.mobileQuantityBtnIcon} />
                  </button>
                  <span className={s.mobileQuantityValue}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        product._id,
                        Math.min(product.stock, item.quantity + 1)
                      )
                    }
                    className={s.mobileQuantityBtn}
                    disabled={item.quantity >= product.stock}
                  >
                    <Plus className={s.mobileQuantityBtnIcon} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(product._id)}
                  className={s.deleteBtn}
                >
                  <Trash2 className={s.deleteBtnIconSm} />
                </button>
              </div>
              
              {/* Десктопний макет */}
              <div className={s.desktopLayout}>
                <div className={s.desktopImageWrapper}>
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 96px"
                      className={s.objectCover}
                    />
                  ) : (
                    <div className={s.desktopPlaceholder}>
                      📱
                    </div>
                  )}
                </div>

                <div className={s.desktopInfo}>
                  <Link
                    href={`/products/${product.slug}`}
                    className={s.desktopProductLink}
                  >
                    {product.name}
                  </Link>

                  {product.category && typeof product.category === 'object' && (
                    <p className={s.categoryText}>
                      {product.category.name}
                    </p>
                  )}

                  <div className={s.desktopControlsWrapper}>
                    <div className={s.desktopQuantityGroup}>
                      <button
                        onClick={() =>
                          updateQuantity(product._id, Math.max(1, item.quantity - 1))
                        }
                        className={s.desktopQuantityBtn}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className={s.mobileQuantityBtnIcon} />
                      </button>
                      <span className={s.desktopQuantityValue}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            Math.min(product.stock, item.quantity + 1)
                          )
                        }
                        className={s.desktopQuantityBtn}
                        disabled={item.quantity >= product.stock}
                      >
                        <Plus className={s.mobileQuantityBtnIcon} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product._id)}
                      className={s.deleteBtn}
                    >
                      <Trash2 className={s.deleteBtnIconMd} />
                    </button>
                  </div>

                  {product.stock < 5 && product.stock > 0 && (
                    <p className={s.lowStockWarning}>
                      Залишилось лише {product.stock} шт.
                    </p>
                  )}

                  {product.stock === 0 && (
                    <p className={s.outOfStock}>
                      Немає в наявності
                    </p>
                  )}
                </div>

                <div className={s.priceColumn}>
                  <div className={s.priceMain}>
                    {formatPrice(product.price * item.quantity)}
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className={s.priceCompare}>
                      {formatPrice(product.comparePrice * item.quantity)}
                    </div>
                  )}
                  <div className={s.priceUnit}>
                    {formatPrice(product.price)} / шт.
                  </div>
                </div>
              </div>
              
              {/* Попередження про залишки (мобільний) */}
              <div className={s.mobileStockWarnings}>
                {product.stock < 5 && product.stock > 0 && (
                  <p className={s.mobileLowStock}>
                    Залишилось лише {product.stock} шт.
                  </p>
                )}
                {product.stock === 0 && (
                  <p className={s.mobileOutOfStock}>
                    Немає в наявності
                  </p>
                )}
              </div>
            </motion.div>
          )})}
            </AnimatePresence>
        </div>
        <div className={s.summaryColumn}>
          <div className={s.summaryCard}>
            <h2 className={s.summaryTitle}>Разом</h2>

            <div className={s.summaryContent}>
              <div className={s.summaryRow}>
                <span className={s.summaryLabel}>Товари ({itemCount})</span>
                <span className={s.summaryValue}>{formatPrice(total)}</span>
              </div>
              <div className={s.summaryRow}>
                <span className={s.summaryLabel}>Доставка</span>
                <span className={s.summaryValue}>
                  {total >= 1000 ? (
                    <span className={s.freeDelivery}>Безкоштовно</span>
                  ) : (
                    formatPrice(50)
                  )}
                </span>
              </div>

              {total < 1000 && (
                <div className={s.deliveryHint}>
                  Додайте товарів на {formatPrice(1000 - total)} для безкоштовної
                  доставки
                </div>
              )}

              <div className={s.totalDivider}>
                <div className={s.totalRow}>
                  <span>До сплати</span>
                  <span>{formatPrice(total + (total >= 1000 ? 0 : 50))}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className={s.checkoutBtn}
            >
              Оформити замовлення
            </button>

            <Link
              href="/products"
              className={s.continueLink}
            >
              Продовжити покупки
            </Link>

            {/* Гарантії */}
            <div className={s.guarantees}>
              <div className={s.guaranteeItem}>
                <span>✓</span>
                <span>Безпечна оплата</span>
              </div>
              <div className={s.guaranteeItem}>
                <span>✓</span>
                <span>Гарантія повернення коштів</span>
              </div>
              <div className={s.guaranteeItem}>
                <span>✓</span>
                <span>Офіційна гарантія</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
