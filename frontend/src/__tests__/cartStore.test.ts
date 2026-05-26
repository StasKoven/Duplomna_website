/**
 * cartStore unit tests — unauthenticated (local) path
 *
 * The authenticated path hits the real API; these tests cover
 * the local-only code branch that runs when isAuthenticated is false.
 *
 * Run with:  npm test  (from the frontend/ folder)
 */

import '@testing-library/jest-dom';

// Mock api so imports don't fail (not called in unauthenticated path)
jest.mock('@/lib/api', () => ({
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

// Silence toast notifications in tests
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types';

const makeProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    _id: 'p1',
    name: 'iPhone 15',
    slug: 'iphone-15',
    description: 'Тест',
    price: 45000,
    cost: 30000,
    category: { _id: 'cat1', name: 'Phones', slug: 'phones', isActive: true, order: 1, createdAt: '', updatedAt: '' },
    sku: 'IPH15-001',
    images: [],
    stock: 10,
    lowStockThreshold: 2,
    specifications: [],
    features: [],
    tags: [],
    rating: { average: 4.5, count: 100 },
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    views: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  } as Product);

// Reset store to empty unauthenticated state before each test
beforeEach(() => {
  useCartStore.setState({ items: [], isAuthenticated: false, isLoading: false });
});

// ---------------------------------------------------------------------------

describe('cartStore — addItem (unauthenticated)', () => {
  it('adds a new product to an empty cart', async () => {
    const product = makeProduct();
    await useCartStore.getState().addItem(product);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect((items[0].product as Product)._id).toBe('p1');
    expect(items[0].quantity).toBe(1);
  });

  it('increments quantity when the same product is added again', async () => {
    const product = makeProduct();
    await useCartStore.getState().addItem(product);
    await useCartStore.getState().addItem(product);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('respects a custom quantity argument', async () => {
    const product = makeProduct();
    await useCartStore.getState().addItem(product, 3);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('keeps products with different IDs as separate items', async () => {
    await useCartStore.getState().addItem(makeProduct({ _id: 'p1', name: 'iPhone 15' }));
    await useCartStore.getState().addItem(makeProduct({ _id: 'p2', name: 'MacBook Pro' }));

    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------

describe('cartStore — updateQuantity (unauthenticated)', () => {
  it('updates the quantity of an existing item', async () => {
    const product = makeProduct();
    await useCartStore.getState().addItem(product);
    await useCartStore.getState().updateQuantity('p1', 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes the item when quantity is set to 0', async () => {
    const product = makeProduct();
    await useCartStore.getState().addItem(product);
    await useCartStore.getState().updateQuantity('p1', 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------

describe('cartStore — removeItem (unauthenticated)', () => {
  it('removes the target item from the cart', async () => {
    await useCartStore.getState().addItem(makeProduct({ _id: 'p1', name: 'iPhone 15' }));
    await useCartStore.getState().removeItem('p1');

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('leaves other items untouched when removing one', async () => {
    await useCartStore.getState().addItem(makeProduct({ _id: 'p1', name: 'iPhone 15' }));
    await useCartStore.getState().addItem(makeProduct({ _id: 'p2', name: 'MacBook Pro', price: 80000 }));
    await useCartStore.getState().removeItem('p1');

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect((items[0].product as Product)._id).toBe('p2');
  });
});

// ---------------------------------------------------------------------------

describe('cartStore — selectors', () => {
  it('getTotalItems sums all item quantities', async () => {
    await useCartStore.getState().addItem(makeProduct({ _id: 'p1', name: 'iPhone 15' }), 2);
    await useCartStore.getState().addItem(makeProduct({ _id: 'p2', name: 'MacBook Pro', price: 80000 }), 3);

    expect(useCartStore.getState().getTotalItems()).toBe(5);
  });

  it('getTotalPrice returns sum of price × quantity for all items', async () => {
    await useCartStore.getState().addItem(makeProduct({ _id: 'p1', name: 'iPhone 15', price: 45000 }), 2);
    await useCartStore.getState().addItem(makeProduct({ _id: 'p2', name: 'AirPods', price: 5000 }), 1);

    // 45000×2 + 5000×1 = 95000
    expect(useCartStore.getState().getTotalPrice()).toBe(95000);
  });
});
