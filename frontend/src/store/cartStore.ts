import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from '@/types'
import { toast } from 'sonner'
import api from '@/lib/api'

interface CartState {
  items: CartItem[]
  isLoading: boolean
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
  fetchCart: () => Promise<void>
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncCartToServer: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isAuthenticated: false,

      setAuthenticated: (value: boolean) => {
        const wasAuthenticated = get().isAuthenticated
        set({ isAuthenticated: value })
        if (value && !wasAuthenticated) {
          // Синхронізуємо локальний кошик з сервером тільки при переході з неавторизованого стану
          get().syncCartToServer()
        }
      },

      syncCartToServer: async () => {
        const { items, isAuthenticated } = get()
        if (!isAuthenticated || items.length === 0) return

        try {
          // Спочатку отримуємо поточний серверний кошик
          const serverResponse = await api.get('/cart')
          const serverCart = serverResponse.data?.cart || []

          // Додаємо тільки ті товари, яких ще немає на сервері
          for (const item of items) {
            const product = item.product as Product
            const existsOnServer = serverCart.some(
              (sc: any) => {
                const serverId = typeof sc.product === 'object' ? sc.product._id : sc.product
                return serverId === product._id
              }
            )

            if (!existsOnServer) {
              await api.post('/cart', {
                productId: product._id,
                quantity: item.quantity
              })
            }
          }

          // Отримуємо оновлений кошик з сервера
          const response = await api.get('/cart')
          set({ items: response.data?.cart || [] })
        } catch (error) {
          console.error('Error syncing cart:', error)
        }
      },

      fetchCart: async () => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) return // Для неавторизованих використовуємо локальний кошик

        try {
          set({ isLoading: true })
          const response = await api.get('/cart')
          set({ items: response.data?.cart || [], isLoading: false })
        } catch (error: any) {
          console.error('Error fetching cart:', error)
          if (error.response?.status !== 401) {
            toast.error('Помилка завантаження кошика')
          }
          set({ isLoading: false })
        }
      },

      addItem: async (product: Product, quantity = 1) => {
        const { isAuthenticated, items } = get()

        if (isAuthenticated) {
          // Для авторизованих - зберігаємо на сервері
          try {
            const response = await api.post('/cart', {
              productId: product._id,
              quantity
            })
            set({ items: response.data?.cart || [] })
            toast.success(`${product.name} додано до кошика`)
          } catch (error: any) {
            console.error('Error adding to cart:', error)
            toast.error(error.response?.data?.message || 'Помилка додавання до кошика')
          }
        } else {
          // Для неавторизованих - зберігаємо локально
          const existingItem = items.find(
            item => (item.product as Product)._id === product._id
          )

          if (existingItem) {
            const updatedItems = items.map(item =>
              (item.product as Product)._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
            set({ items: updatedItems })
          } else {
            const newItem: CartItem = {
              product: product,
              quantity: quantity
            }
            set({ items: [...items, newItem] })
          }
          toast.success(`${product.name} додано до кошика`)
        }
      },

      removeItem: async (productId: string) => {
        const { isAuthenticated, items } = get()

        if (isAuthenticated) {
          try {
            const response = await api.delete(`/cart/${productId}`)
            set({ items: response.data?.cart || [] })
            toast.success('Товар видалено з кошика')
          } catch (error: any) {
            console.error('Error removing from cart:', error)
            toast.error('Помилка видалення з кошика')
          }
        } else {
          const updatedItems = items.filter(
            item => (item.product as Product)._id !== productId
          )
          set({ items: updatedItems })
          toast.success('Товар видалено з кошика')
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId)
          return
        }

        const { isAuthenticated, items } = get()

        if (isAuthenticated) {
          try {
            const response = await api.put(`/cart/${productId}`, { quantity })
            set({ items: response.data?.cart || [] })
          } catch (error: any) {
            console.error('Error updating cart:', error)
            toast.error('Помилка оновлення кошика')
          }
        } else {
          const updatedItems = items.map(item =>
            (item.product as Product)._id === productId
              ? { ...item, quantity }
              : item
          )
          set({ items: updatedItems })
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = get()

        if (isAuthenticated) {
          try {
            await api.delete('/cart')
            set({ items: [] })
            toast.success('Кошик очищено')
          } catch (error: any) {
            console.error('Error clearing cart:', error)
            toast.error('Помилка очищення кошика')
          }
        } else {
          set({ items: [] })
          toast.success('Кошик очищено')
        }
      },

      getTotalItems: () => {
        const items = get().items || []
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        const items = get().items || []
        return items.reduce((total, item) => {
          const product = item.product
          if (typeof product === 'string') return total
          return total + product.price * item.quantity
        }, 0)
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }), // Зберігаємо тільки items
    }
  )
)
