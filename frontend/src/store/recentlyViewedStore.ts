import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

const MAX_ITEMS = 12

interface RecentlyViewedStore {
  items: Product[]
  addProduct: (product: Product) => void
  clearAll: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (product) => {
        const filtered = get().items.filter((p) => p._id !== product._id)
        set({ items: [product, ...filtered].slice(0, MAX_ITEMS) })
      },

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed',
    }
  )
)
