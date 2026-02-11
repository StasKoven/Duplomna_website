'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

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
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Завантаження списку бажань...</p>
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
          <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Список бажань порожній</h1>
          <p className="text-muted-foreground mb-8">
            Додавайте улюблені товари до списку бажань, щоб не втратити їх
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition"
          >
            Перейти до каталогу
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Список бажань</h1>
          <p className="text-muted-foreground">
            У вас {items.length} {items.length === 1 ? 'товар' : 'товарів'} у списку бажань
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Ви впевнені, що хочете очистити весь список бажань?')) {
                clearWishlist()
                toast.success('Список бажань очищено')
              }
            }}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Очистити все
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card border rounded-lg overflow-hidden group"
          >
            <div className="relative aspect-square bg-muted">
              {item.images && item.images[0]?.url ? (
                <Image
                  src={item.images[0].url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-6xl">
                  📱
                </div>
              )}
              <button
                onClick={() => handleRemove(item._id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition"
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>

            <div className="p-4">
              <Link
                href={`/products/${item.slug}`}
                className="font-semibold hover:text-primary transition line-clamp-2 mb-2 block"
              >
                {item.name}
              </Link>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-bold">{item.price.toLocaleString('uk-UA')} ₴</span>
                {item.comparePrice && item.comparePrice > item.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {item.comparePrice.toLocaleString('uk-UA')} ₴
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                {item.stock > 0 ? (
                  <span className="text-sm text-green-600">В наявності</span>
                ) : (
                  <span className="text-sm text-red-600">Немає в наявності</span>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(item)}
                disabled={item.stock === 0}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" />
                Додати до кошика
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
