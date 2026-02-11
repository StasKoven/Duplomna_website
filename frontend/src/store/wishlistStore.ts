import { create } from 'zustand'
import { Product } from '@/types'
import { toast } from 'sonner'
import api from '@/lib/api'

interface WishlistStore {
  items: Product[]
  isLoading: boolean
  fetchWishlist: () => Promise<void>
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  clearWishlist: () => Promise<void>
  isInWishlist: (productId: string) => boolean
  getTotalItems: () => number
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    try {
      set({ isLoading: true })
      const response = await api.get('/wishlist')
      // Backend returns { wishlist: Product[] }
      set({ items: response.data?.wishlist || [], isLoading: false })
    } catch (error: any) {
      console.error('Error fetching wishlist:', error)
      // Don't show error if user is not authenticated
      if (error.response?.status !== 401) {
        toast.error('Помилка завантаження списку бажань')
      }
      set({ items: [], isLoading: false })
    }
  },

  addToWishlist: async (product) => {
    try {
      // Check if already in wishlist
      if (get().isInWishlist(product._id)) {
        toast.info('Товар вже у списку бажань')
        return
      }

      await api.post(`/wishlist/${product._id}`)
      set((state) => ({ items: [...state.items, product] }))
      toast.success('Додано до списку бажань')
    } catch (error: any) {
      console.error('Error adding to wishlist:', error)
      if (error.response?.status === 401) {
        toast.error('Увійдіть в систему щоб додати до списку бажань')
      } else {
        toast.error(error.response?.data?.message || 'Помилка додавання до списку бажань')
      }
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`)
      set((state) => ({
        items: state.items.filter(item => item._id !== productId)
      }))
      toast.success('Видалено зі списку бажань')
    } catch (error: any) {
      console.error('Error removing from wishlist:', error)
      toast.error('Помилка видалення зі списку бажань')
    }
  },

  clearWishlist: async () => {
    try {
      await api.delete('/wishlist')
      set({ items: [] })
      toast.success('Список бажань очищено')
    } catch (error: any) {
      console.error('Error clearing wishlist:', error)
      toast.error('Помилка очищення списку бажань')
    }
  },

  isInWishlist: (productId) => {
    return get().items.some(item => item._id === productId)
  },

  getTotalItems: () => {
    return get().items.length
  }
}))
