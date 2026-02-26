import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'
import { toast } from 'sonner'

interface ComparisonItem {
  categoryId: string
  categoryName: string
  products: Product[]
}

interface ComparisonStore {
  comparisons: ComparisonItem[]
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

      addToComparison: (categoryId, categoryName, product) => {
        set((state) => {
          const existing = state.comparisons.find(c => c.categoryId === categoryId)
          
          if (existing) {
            // Check if product already exists
            if (existing.products.some(p => p._id === product._id)) {
              toast.info('Товар вже у порівнянні')
              return state
            }
            
            // Check max limit
            if (existing.products.length >= 4) {
              toast.error('Максимум 4 товари для порівняння')
              return state
            }
            
            return {
              comparisons: state.comparisons.map(c =>
                c.categoryId === categoryId
                  ? { ...c, products: [...c.products, product] }
                  : c
              )
            }
          } else {
            return {
              comparisons: [
                ...state.comparisons,
                { categoryId, categoryName, products: [product] }
              ]
            }
          }
        })
      },

      removeFromComparison: (categoryId, productId) => {
        set((state) => ({
          comparisons: state.comparisons
            .map(c =>
              c.categoryId === categoryId
                ? { ...c, products: c.products.filter(p => p._id !== productId) }
                : c
            )
            .filter(c => c.products.length > 0) // Remove empty comparisons
        }))
      },

      clearComparison: (categoryId) => {
        set((state) => ({
          comparisons: state.comparisons.filter(c => c.categoryId !== categoryId)
        }))
      },

      getComparisonByCategory: (categoryId) => {
        return get().comparisons.find(c => c.categoryId === categoryId)
      },

      getTotalItems: () => {
        return get().comparisons.reduce((total, c) => total + c.products.length, 0)
      }
    }),
    {
      name: 'comparison-storage'
    }
  )
)
