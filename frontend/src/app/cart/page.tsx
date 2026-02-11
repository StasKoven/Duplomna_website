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

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Завантаження кошика...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Ваш кошик порожній</h1>
          <p className="text-muted-foreground mb-8">
            Додайте товари до кошика, щоб продовжити покупки
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition"
          >
            Перейти до покупок
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowAuthModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background rounded-xl shadow-xl p-6"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-accent rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Оформлення замовлення</h3>
                <p className="text-sm text-muted-foreground">
                  Для оформлення замовлення потрібно увійти в акаунт або зареєструватися
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login?redirect=/cart"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  <LogIn className="h-5 w-5" />
                  Увійти
                </Link>
                <Link
                  href="/register?redirect=/cart"
                  className="flex items-center justify-center gap-2 w-full border py-3 px-4 rounded-lg font-medium hover:bg-accent transition"
                >
                  <UserPlus className="h-5 w-5" />
                  Зареєструватися
                </Link>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Ваш кошик збережеться після входу
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="container-custom py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Кошик ({itemCount})</h1>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => {
              const product = item.product as Product
              return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card border rounded-lg p-3 sm:p-4"
              >
                {/* Mobile Layout */}
                <div className="flex gap-3 sm:hidden">
                <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-3xl">
                      📱
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-medium text-sm hover:text-primary transition line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <div className="font-bold text-base mt-1">
                    {formatPrice(product.price * item.quantity)}
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.comparePrice * item.quantity)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile Controls */}
              <div className="flex items-center justify-between mt-3 sm:hidden">
                <div className="flex items-center gap-1 border rounded-md">
                  <button
                    onClick={() =>
                      updateQuantity(product._id, Math.max(1, item.quantity - 1))
                    }
                    className="p-1.5 hover:bg-accent transition"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        product._id,
                        Math.min(product.stock, item.quantity + 1)
                      )
                    }
                    className="p-1.5 hover:bg-accent transition"
                    disabled={item.quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(product._id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {/* Desktop Layout */}
              <div className="hidden sm:flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl">
                      📱
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-semibold hover:text-primary transition line-clamp-2"
                  >
                    {product.name}
                  </Link>

                  {product.category && typeof product.category === 'object' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.category.name}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 border rounded-md">
                      <button
                        onClick={() =>
                          updateQuantity(product._id, Math.max(1, item.quantity - 1))
                        }
                        className="p-2 hover:bg-accent transition"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            product._id,
                            Math.min(product.stock, item.quantity + 1)
                          )
                        }
                        className="p-2 hover:bg-accent transition"
                        disabled={item.quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product._id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {product.stock < 5 && product.stock > 0 && (
                    <p className="text-sm text-orange-600 mt-2">
                      Залишилось лише {product.stock} шт.
                    </p>
                  )}

                  {product.stock === 0 && (
                    <p className="text-sm text-destructive mt-2">
                      Немає в наявності
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg">
                    {formatPrice(product.price * item.quantity)}
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.comparePrice * item.quantity)}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatPrice(product.price)} / шт.
                  </div>
                </div>
              </div>
              
              {/* Stock warnings for both layouts */}
              <div className="sm:hidden mt-2">
                {product.stock < 5 && product.stock > 0 && (
                  <p className="text-xs text-orange-600">
                    Залишилось лише {product.stock} шт.
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-xs text-destructive">
                    Немає в наявності
                  </p>
                )}
              </div>
            </motion.div>
          )})}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-lg p-4 sm:p-6 sticky top-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Разом</h2>

            <div className="space-y-3 mb-4 sm:mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Товари ({itemCount})</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span className="font-medium">
                  {total >= 1000 ? (
                    <span className="text-green-600">Безкоштовно</span>
                  ) : (
                    formatPrice(50)
                  )}
                </span>
              </div>

              {total < 1000 && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Додайте товарів на {formatPrice(1000 - total)} для безкоштовної
                  доставки
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>До сплати</span>
                  <span>{formatPrice(total + (total >= 1000 ? 0 : 50))}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-primary text-white py-2.5 sm:py-3 px-4 rounded-md hover:bg-primary/90 transition font-medium mb-3 text-sm sm:text-base"
            >
              Оформити замовлення
            </button>

            <Link
              href="/products"
              className="block text-center text-sm text-primary hover:underline"
            >
              Продовжити покупки
            </Link>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t space-y-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Безпечна оплата</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Гарантія повернення коштів</span>
              </div>
              <div className="flex items-center gap-2">
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
