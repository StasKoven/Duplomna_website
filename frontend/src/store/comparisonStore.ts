import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'
import { toast } from 'sonner'
import api from '@/lib/api'

interface ComparisonItem {
  categoryId: string
  categoryName: string
  products: Product[]
}

interface ComparisonStore {
  comparisons: ComparisonItem[]
  isLoading: boolean
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
  fetchComparisons: () => Promise<void>
  addToComparison: (categoryId: string, categoryName: string, product: Product) => void
  removeFromComparison: (categoryId: string, productId: string) => void
  clearComparison: (categoryId: string) => void
  getComparisonByCategory: (categoryId: string) => ComparisonItem | undefined
  getTotalItems: () => number
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      comparisons: [],
      isLoading: false,
      isAuthenticated: false,

      setAuthenticated: (value: boolean) => {
        set({ isAuthenticated: value })
      },

      fetchComparisons: async () => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) return

        try {
          set({ isLoading: true })
          const response = await api.get('/comparisons')
          const serverComparisons = response.data?.comparisons || []

          const mapped: ComparisonItem[] = serverComparisons
            .filter((c: any) => c.products && c.products.length > 0)
            .map((c: any) => ({
              categoryId: typeof c.category === 'object' ? c.category._id : c.category,
              categoryName: typeof c.category === 'object' ? c.category.name : '',
              products: c.products.filter((p: any) => p != null),
            }))

          set({ comparisons: mapped, isLoading: false })
        } catch (error: any) {
          console.error('Error fetching comparisons:', error)
          if (error.response?.status !== 401) {
            toast.error('Помилка завантаження порівнянь')
          }
          set({ isLoading: false })
        }
      },

      addToComparison: async (categoryId, categoryName, product) => {
        const { isAuthenticated } = get()

        if (isAuthenticated) {
          // Server-synced mode
          try {
            await api.post(`/comparisons/${product._id}`)
            // Re-fetch to get fully populated data
            await get().fetchComparisons()
            toast.success('Додано до порівняння')
          } catch (error: any) {
            console.error('Error adding to comparison:', error)
            const msg = error.response?.data?.message
            if (msg === 'Product already in comparison') {
              toast.info('Товар вже у порівнянні')
            } else if (msg === 'Maximum 4 products can be compared') {
              toast.error('Максимум 4 товари для порівняння')
            } else {
              toast.error(msg || 'Помилка додавання до порівняння')
            }
          }
        } else {
          // Local-only mode (not logged in)
          set((state) => {
            const existing = state.comparisons.find(c => c.categoryId === categoryId)

            if (existing) {
              if (existing.products.some(p => p._id === product._id)) {
                toast.info('Товар вже у порівнянні')
                return state
              }
              if (existing.products.length >= 4) {
                toast.error('Максимум 4 товари для порівняння')
                return state
              }
              toast.success('Додано до порівняння')
              return {
                comparisons: state.comparisons.map(c =>
                  c.categoryId === categoryId
                    ? { ...c, products: [...c.products, product] }
                    : c
                )
              }
            } else {
              toast.success('Додано до порівняння')
              return {
                comparisons: [
                  ...state.comparisons,
                  { categoryId, categoryName, products: [product] }
                ]
              }
            }
          })
        }
      },

      removeFromComparison: async (categoryId, productId) => {
        const { isAuthenticated } = get()

        if (isAuthenticated) {
          try {
            await api.delete(`/comparisons/${productId}`)
            await get().fetchComparisons()
            toast.success('Видалено з порівняння')
          } catch (error: any) {
            console.error('Error removing from comparison:', error)
            toast.error('Помилка видалення з порівняння')
          }
        } else {
          set((state) => ({
            comparisons: state.comparisons
              .map(c =>
                c.categoryId === categoryId
                  ? { ...c, products: c.products.filter(p => p._id !== productId) }
                  : c
              )
              .filter(c => c.products.length > 0)
          }))
          toast.success('Видалено з порівняння')
        }
      },

      clearComparison: async (categoryId) => {
        const { isAuthenticated } = get()

        if (isAuthenticated) {
          try {
            await api.delete(`/comparisons/category/${categoryId}`)
            await get().fetchComparisons()
            toast.success('Список порівняння очищено')
          } catch (error: any) {
            console.error('Error clearing comparison:', error)
            toast.error('Помилка очищення порівняння')
          }
        } else {
          set((state) => ({
            comparisons: state.comparisons.filter(c => c.categoryId !== categoryId)
          }))
          toast.success('Список порівняння очищено')
        }
      },

      getComparisonByCategory: (categoryId) => {
        return get().comparisons.find(c => c.categoryId === categoryId)
      },

      getTotalItems: () => {
        return get().comparisons.reduce((total, c) => total + c.products.length, 0)
      }
    }),
    {
      name: 'comparison-storage',
      partialize: (state) => ({ comparisons: state.comparisons }),
    }
  )
)
