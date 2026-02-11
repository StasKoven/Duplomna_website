'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

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

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Головна',
      isActive: pathname === '/'
    },
    {
      href: '/products',
      icon: Search,
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg md:hidden">
      <div className="flex items-stretch h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1.5 transition-colors',
                item.isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div className="relative mb-0.5">
                <Icon className={cn(
                  'h-5 w-5',
                  item.isActive && 'stroke-[2.5px]'
                )} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {item.badge > 99 ? '99' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] leading-tight',
                item.isActive ? 'font-semibold' : 'font-normal'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}

