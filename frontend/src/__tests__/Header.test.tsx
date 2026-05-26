/**
 * Header component smoke tests
 *
 * Tests that Header renders the key elements and search form.
 * Mocks are required because Header uses many Zustand stores and Next.js router.
 *
 * Run with:  npm test  (from the frontend/ folder)
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// ----- Mock all external dependencies -----

// Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
}));

// Next.js Link renders as <a>
jest.mock('next/link', () =>
  function Link({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  }
);

// Framer Motion strips animations in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Zustand stores
jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    isAuthenticated: false,
    logout: jest.fn(),
  }),
}));

jest.mock('@/store/cartStore', () => ({
  useCartStore: () => ({ getTotalItems: () => 0 }),
}));

jest.mock('@/store/wishlistStore', () => ({
  useWishlistStore: () => ({ getTotalItems: () => 0 }),
}));

jest.mock('@/store/comparisonStore', () => ({
  useComparisonStore: () => ({ getTotalItems: () => 0 }),
}));

// API — return empty products for autocomplete
jest.mock('@/lib/api', () => ({
  default: {
    get: jest.fn().mockResolvedValue({ data: { products: [] } }),
  },
}));

// NotificationBell (has its own side effects)
jest.mock('@/components/layout/NotificationBell', () => () => null);

// CSS module
jest.mock('./Header.module.css', () => new Proxy({}, { get: (_: any, prop: string) => prop }), { virtual: true });

// -----

import Header from '@/components/layout/Header';

// -----

describe('Header', () => {
  it('renders the logo link', () => {
    render(<Header />);
    // Logo renders as "Tech<span>Store</span>", so match via accessible link name
    const logoLink = screen.getByRole('link', { name: /tech.*store/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders the desktop search input', () => {
    render(<Header />);
    const inputs = screen.getAllByPlaceholderText('Пошук товарів...');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Каталог')).toBeInTheDocument();
    expect(screen.getByText('Категорії')).toBeInTheDocument();
  });

  it('renders login link when user is not authenticated', () => {
    render(<Header />);
    expect(screen.getByText('Увійти')).toBeInTheDocument();
  });

  it('search input updates when user types', () => {
    render(<Header />);
    const input = screen.getAllByPlaceholderText('Пошук товарів...')[0] as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'iPhone' } });
    expect(input.value).toBe('iPhone');
  });
});
