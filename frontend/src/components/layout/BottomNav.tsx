'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, ShoppingCart, Heart, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import s from './BottomNav.module.css'

export default function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { getTotalItems } = useCartStore()
  const { getTotalItems: getWishlistTotal } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const cartItemsCount = mounted ? getTotalItems() : 0
  const wishlistItemsCount = mounted ? getWishlistTotal() : 0
  const isAuth = mounted ? isAuthenticated : false

  // Елементи навігації
  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Головна',
      isActive: pathname === '/'
    },
    {
      href: '/products',
      icon: LayoutGrid,
      label: 'Каталог',
      isActive: pathname === '/products' || pathname.startsWith('/products/')
    },
    {
      href: '/cart',
      icon: ShoppingCart,
      label: 'Кошик',
      isActive: pathname === '/cart',
      badge: cartItemsCount > 0 ? cartItemsCount : undefined
    },
    {
      href: '/wishlist',
      icon: Heart,
      label: 'Бажання',
      isActive: pathname === '/wishlist',
      badge: wishlistItemsCount > 0 ? wishlistItemsCount : undefined
    },
    {
      href: isAuth ? '/profile' : '/login',
      icon: User,
      label: isAuth ? 'Профіль' : 'Увійти',
      isActive: pathname === '/profile' || pathname === '/login'
    }
  ]

  return (
    // Нижня навігаційна панель
    <nav className={s.nav}>
      <div className={s.navContainer}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            // Посилання навігації
            <Link
              key={item.href}
              href={item.href}
              className={item.isActive ? s.navLinkActive : s.navLink}
            >
              {/* Іконка з бейджем */}
              <div className={s.iconWrapper}>
                <Icon className={item.isActive ? s.iconActive : s.icon} />
                {item.badge && (
                  <span className={s.badge}>
                    {item.badge > 99 ? '99' : item.badge}
                  </span>
                )}
              </div>
              {/* Текстова мітка */}
              <span className={item.isActive ? s.labelActive : s.label}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Безпечна зона для мобільних пристроїв */}
      <div className={s.safeArea} />
    </nav>
  )
}

