import type { Product } from '@/types'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

import api from '@/lib/api'
import { toast } from 'sonner'
import { useComparisonStore } from '@/store/comparisonStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore'
import { useWishlistStore } from '@/store/wishlistStore'

const mockedApi = api as jest.Mocked<typeof api>
const mockedToast = toast as jest.Mocked<typeof toast>
let useLanguageStore: typeof import('@/store/languageStore').useLanguageStore

const makeProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    _id: 'p1',
    name: 'iPhone 15',
    slug: 'iphone-15',
    description: 'Phone',
    price: 45000,
    cost: 30000,
    category: {
      _id: 'cat1',
      name: 'Phones',
      slug: 'phones',
      isActive: true,
      order: 1,
      createdAt: '',
      updatedAt: '',
    },
    sku: 'IPH15',
    images: [],
    stock: 10,
    lowStockThreshold: 2,
    specifications: [],
    features: [],
    tags: [],
    rating: { average: 4.8, count: 10 },
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    views: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  } as Product)

beforeAll(() => {
  ;(globalThis as any).fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
  })
  ;({ useLanguageStore } = require('@/store/languageStore'))
})

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()

  useComparisonStore.setState({
    comparisons: [],
    isLoading: false,
    isAuthenticated: false,
  })
  useLanguageStore.setState({
    language: 'ua',
    translations: {},
  })
  useNotificationStore.setState({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
  })
  useRecentlyViewedStore.setState({ items: [] })
  useWishlistStore.setState({ items: [], isLoading: false })
})

describe('recentlyViewedStore', () => {
  it('adds the newest product first and moves duplicates to the front', () => {
    const first = makeProduct({ _id: 'p1', name: 'Phone' })
    const second = makeProduct({ _id: 'p2', name: 'Laptop' })

    useRecentlyViewedStore.getState().addProduct(first)
    useRecentlyViewedStore.getState().addProduct(second)
    useRecentlyViewedStore.getState().addProduct(first)

    expect(useRecentlyViewedStore.getState().items.map((p) => p._id)).toEqual(['p1', 'p2'])
  })

  it('keeps only twelve recent products', () => {
    Array.from({ length: 14 }, (_, i) =>
      useRecentlyViewedStore.getState().addProduct(makeProduct({ _id: `p${i}` }))
    )

    const ids = useRecentlyViewedStore.getState().items.map((p) => p._id)
    expect(ids).toHaveLength(12)
    expect(ids[0]).toBe('p13')
    expect(ids).not.toContain('p0')
  })

  it('clears all recently viewed products', () => {
    useRecentlyViewedStore.getState().addProduct(makeProduct())
    useRecentlyViewedStore.getState().clearAll()

    expect(useRecentlyViewedStore.getState().items).toEqual([])
  })
})

describe('languageStore', () => {
  it('returns nested translations by dot path', () => {
    useLanguageStore.setState({
      translations: { header: { cart: 'Cart' } },
    })

    expect(useLanguageStore.getState().t('header.cart')).toBe('Cart')
  })

  it('falls back to the key when translation is missing or not a string', () => {
    useLanguageStore.setState({
      translations: { header: { cart: { label: 'Cart' } } },
    })

    expect(useLanguageStore.getState().t('header.search')).toBe('header.search')
    expect(useLanguageStore.getState().t('header.cart')).toBe('header.cart')
  })

  it('loads translations for the selected language', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ common: { yes: 'Yes' } }),
    }) as jest.Mock

    await useLanguageStore.getState().setLanguage('en')

    expect(global.fetch).toHaveBeenCalledWith('/locales/en/translation.json')
    expect(useLanguageStore.getState().translations.common.yes).toBe('Yes')
  })

  it('does not overwrite translations if language changed while loading', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ common: { yes: 'Yes' } }),
    }) as jest.Mock

    const loading = useLanguageStore.getState().loadTranslations('en')
    useLanguageStore.setState({ language: 'ua' })
    await loading

    expect(useLanguageStore.getState().translations).toEqual({})
  })
})

describe('wishlistStore', () => {
  it('fetches wishlist and filters empty backend entries', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { wishlist: [makeProduct(), null] } } as any)

    await useWishlistStore.getState().fetchWishlist()

    expect(useWishlistStore.getState().items).toHaveLength(1)
    expect(useWishlistStore.getState().isLoading).toBe(false)
  })

  it('adds a product when it is not already in wishlist', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: {} } as any)
    const product = makeProduct()

    await useWishlistStore.getState().addToWishlist(product)

    expect(mockedApi.post).toHaveBeenCalledWith('/wishlist/p1')
    expect(useWishlistStore.getState().items).toEqual([product])
    expect(mockedToast.success).toHaveBeenCalled()
  })

  it('does not add duplicate wishlist products', async () => {
    const product = makeProduct()
    useWishlistStore.setState({ items: [product] })

    await useWishlistStore.getState().addToWishlist(product)

    expect(mockedApi.post).not.toHaveBeenCalled()
    expect(mockedToast.info).toHaveBeenCalled()
  })

  it('removes and clears wishlist items through the API', async () => {
    mockedApi.delete.mockResolvedValue({ data: {} } as any)
    useWishlistStore.setState({ items: [makeProduct(), makeProduct({ _id: 'p2' })] })

    await useWishlistStore.getState().removeFromWishlist('p1')
    expect(useWishlistStore.getState().items.map((p) => p._id)).toEqual(['p2'])

    await useWishlistStore.getState().clearWishlist()
    expect(useWishlistStore.getState().items).toEqual([])
  })

  it('resets loading and keeps the list empty on fetch failure', async () => {
    mockedApi.get.mockRejectedValueOnce({ response: { status: 500 } })

    await useWishlistStore.getState().fetchWishlist()

    expect(useWishlistStore.getState().items).toEqual([])
    expect(useWishlistStore.getState().isLoading).toBe(false)
    expect(mockedToast.error).toHaveBeenCalled()
  })
})

describe('comparisonStore', () => {
  it('adds local comparison products by category and counts them', async () => {
    await useComparisonStore.getState().addToComparison('cat1', 'Phones', makeProduct())
    await useComparisonStore
      .getState()
      .addToComparison('cat1', 'Phones', makeProduct({ _id: 'p2' }))

    expect(useComparisonStore.getState().getComparisonByCategory('cat1')?.products).toHaveLength(2)
    expect(useComparisonStore.getState().getTotalItems()).toBe(2)
  })

  it('prevents duplicate and fifth local comparison product', async () => {
    const store = useComparisonStore.getState()
    await store.addToComparison('cat1', 'Phones', makeProduct({ _id: 'p1' }))
    await store.addToComparison('cat1', 'Phones', makeProduct({ _id: 'p1' }))

    expect(useComparisonStore.getState().getTotalItems()).toBe(1)
    expect(mockedToast.info).toHaveBeenCalled()

    for (let i = 2; i <= 5; i += 1) {
      await store.addToComparison('cat1', 'Phones', makeProduct({ _id: `p${i}` }))
    }

    expect(useComparisonStore.getState().getTotalItems()).toBe(4)
    expect(mockedToast.error).toHaveBeenCalled()
  })

  it('removes products and drops an empty comparison category', async () => {
    await useComparisonStore.getState().addToComparison('cat1', 'Phones', makeProduct())
    await useComparisonStore.getState().removeFromComparison('cat1', 'p1')

    expect(useComparisonStore.getState().comparisons).toEqual([])
  })

  it('fetches and maps server comparisons in authenticated mode', async () => {
    useComparisonStore.setState({ isAuthenticated: true })
    mockedApi.get.mockResolvedValueOnce({
      data: {
        comparisons: [
          {
            category: { _id: 'cat1', name: 'Phones' },
            products: [makeProduct(), null],
          },
        ],
      },
    } as any)

    await useComparisonStore.getState().fetchComparisons()

    expect(useComparisonStore.getState().comparisons).toEqual([
      { categoryId: 'cat1', categoryName: 'Phones', products: [makeProduct()] },
    ])
  })

  it('uses server API for authenticated add/remove/clear actions', async () => {
    useComparisonStore.setState({ isAuthenticated: true })
    mockedApi.post.mockResolvedValue({ data: {} } as any)
    mockedApi.delete.mockResolvedValue({ data: {} } as any)
    mockedApi.get.mockResolvedValue({ data: { comparisons: [] } } as any)

    await useComparisonStore.getState().addToComparison('cat1', 'Phones', makeProduct())
    await useComparisonStore.getState().removeFromComparison('cat1', 'p1')
    await useComparisonStore.getState().clearComparison('cat1')

    expect(mockedApi.post).toHaveBeenCalledWith('/comparisons/p1')
    expect(mockedApi.delete).toHaveBeenCalledWith('/comparisons/p1')
    expect(mockedApi.delete).toHaveBeenCalledWith('/comparisons/category/cat1')
  })
})

describe('notificationStore', () => {
  const unread = {
    _id: 'n1',
    type: 'system' as const,
    title: 'Title',
    message: 'Message',
    link: null,
    isRead: false,
    createdAt: '2026-01-01',
  }

  it('fetches notifications and unread count', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { notifications: [unread], unreadCount: 1 },
    } as any)

    await useNotificationStore.getState().fetchNotifications()

    expect(useNotificationStore.getState().notifications).toEqual([unread])
    expect(useNotificationStore.getState().unreadCount).toBe(1)
    expect(useNotificationStore.getState().isLoading).toBe(false)
  })

  it('fetches only unread count', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { unreadCount: 3 } } as any)

    await useNotificationStore.getState().fetchUnreadCount()

    expect(mockedApi.get).toHaveBeenCalledWith('/notifications/unread-count')
    expect(useNotificationStore.getState().unreadCount).toBe(3)
  })

  it('marks one or all notifications as read', async () => {
    mockedApi.put.mockResolvedValue({ data: {} } as any)
    useNotificationStore.setState({
      notifications: [unread, { ...unread, _id: 'n2' }],
      unreadCount: 2,
    })

    await useNotificationStore.getState().markAsRead('n1')
    expect(useNotificationStore.getState().notifications[0].isRead).toBe(true)
    expect(useNotificationStore.getState().unreadCount).toBe(1)

    await useNotificationStore.getState().markAllAsRead()
    expect(useNotificationStore.getState().notifications.every((n) => n.isRead)).toBe(true)
    expect(useNotificationStore.getState().unreadCount).toBe(0)
  })

  it('deletes unread notifications and adjusts unread count', async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: {} } as any)
    useNotificationStore.setState({ notifications: [unread], unreadCount: 1 })

    await useNotificationStore.getState().deleteNotification('n1')

    expect(useNotificationStore.getState().notifications).toEqual([])
    expect(useNotificationStore.getState().unreadCount).toBe(0)
  })

  it('resets loading on fetch failure', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('network'))

    await useNotificationStore.getState().fetchNotifications()

    expect(useNotificationStore.getState().isLoading).toBe(false)
  })
})
