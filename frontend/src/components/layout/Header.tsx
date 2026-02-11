'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  Heart,
  ShoppingBag,
  LogOut,
  Settings,
  Package,
  GitCompare,
  Home,
  Grid3X3,
  Info,
  Phone
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useComparisonStore } from '@/store/comparisonStore'
import { cn } from '@/lib/utils'

export default function Header() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { user, isAuthenticated, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const { getTotalItems: getWishlistTotal } = useWishlistStore()
  const { getTotalItems: getComparisonTotal } = useComparisonStore()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const cartItemsCount = mounted ? getTotalItems() : 0
  const wishlistItemsCount = mounted ? getWishlistTotal() : 0
  const comparisonItemsCount = mounted ? getComparisonTotal() : 0
  const isAuth = mounted ? isAuthenticated : false
  const currentUser = mounted ? user : null

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMobileSearchOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    router.push('/')
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-all duration-300',
          isScrolled
            ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
            : 'bg-background'
        )}
        suppressHydrationWarning
      >
        <div className="container-custom" suppressHydrationWarning>
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            {/* ==================== */}
            {/* Mobile Menu Toggle Button */}
            {/* Кнопка відкриття меню на мобільних пристроях */}
            {/* Видима тільки на екранах < md */}
            {/* ==================== */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -ml-2 hover:bg-accent rounded-md"
              aria-label="Меню"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* ==================== */}
            {/* Logo Section */}
            {/* Логотип магазину з посиланням на головну */}
            {/* ==================== */}
            <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-lg sm:text-xl font-bold">TechStore</span>
            </Link>

            {/* ==================== */}
            {/* Desktop Navigation Menu */}
            {/* Горизонтальне меню для desktop */}
            {/* Посилання: Каталог, Категорії, Про нас, Контакти */}
            {/* ==================== */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/products"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Каталог
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Категорії
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Про нас
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Контакти
              </Link>
            </nav>

            {/* ==================== */}
            {/* Desktop Search Bar */}
            {/* Поле пошуку товарів для desktop */}
            {/* Видиме тільки на екранах >= lg */}
            {/* ==================== */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук товарів..."
                  className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </form>

            {/* ==================== */}
            {/* Right Actions Section */}
            {/* Кнопки дій: пошук, порівняння, бажання, кошик, профіль */}
            {/* ==================== */}
            <div className="flex items-center">
              {/* Mobile Search Toggle - Кнопка пошуку для мобільних */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="lg:hidden p-2 hover:bg-accent rounded-md"
                aria-label="Пошук"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Compare Button - Кнопка порівняння товарів */}
              {/* Прихована на найменших екранах */}
              <Link href="/compare" className="hidden sm:flex relative p-2 hover:bg-accent rounded-md">
                <GitCompare className="h-5 w-5" />
                {comparisonItemsCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                    {comparisonItemsCount}
                  </span>
                )}
              </Link>

              {/* Wishlist Button - Кнопка списку бажань */}
              {/* Показує кількість товарів у бажаннях */}
              <Link href="/wishlist" className="relative p-2 hover:bg-accent rounded-md">
                <Heart className="h-5 w-5" />
                {wishlistItemsCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {wishlistItemsCount}
                  </span>
                )}
              </Link>

              {/* Cart Button - Кнопка кошика */}
              {/* Показує кількість товарів у кошику */}
              <Link href="/cart" className="relative p-2 hover:bg-accent rounded-md">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* ==================== */}
              {/* User Menu - Desktop */}
              {/* Меню користувача для desktop */}
              {/* Показує аватар та випадаюче меню */}
              {/* ==================== */}
              <div className="relative hidden sm:block">
                {isAuth ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center p-2 hover:bg-accent rounded-md"
                    >
                      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                        {currentUser?.firstName?.[0]}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsUserMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-lg z-50"
                          >
                            <div className="px-3 py-2 text-sm border-b">
                              <p className="font-medium">{currentUser?.firstName} {currentUser?.lastName}</p>
                              <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                            </div>

                            <Link
                              href="/profile"
                              className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>Профіль</span>
                            </Link>

                            <Link
                              href="/orders"
                              className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Package className="h-4 w-4" />
                              <span>Замовлення</span>
                            </Link>

                            {currentUser?.role === 'admin' && (
                              <Link
                                href="/admin"
                                className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Settings className="h-4 w-4" />
                                <span>Адмін панель</span>
                              </Link>
                            )}

                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded text-red-600"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Вийти</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 p-2 text-sm font-medium hover:bg-accent rounded-md"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden lg:inline">Увійти</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t py-3"
              >
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Пошук товарів..."
                      autoFocus
                      className="w-full rounded-md border border-input bg-background px-10 py-2.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-14 left-0 bottom-0 w-[280px] bg-background border-r z-50 md:hidden overflow-y-auto"
            >
              <div className="p-4">
                {/* User Section for Mobile */}
                {isAuth ? (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {currentUser?.firstName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center space-x-3 mb-4 p-3 bg-primary text-primary-foreground rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Увійти в акаунт</span>
                  </Link>
                )}

                {/* Navigation Links */}
                <nav className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    Меню
                  </p>
                  <Link
                    href="/"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                    onClick={closeMobileMenu}
                  >
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <span>Головна</span>
                  </Link>
                  <Link
                    href="/products"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                    onClick={closeMobileMenu}
                  >
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    <span>Каталог</span>
                  </Link>
                  <Link
                    href="/categories"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                    onClick={closeMobileMenu}
                  >
                    <Grid3X3 className="h-5 w-5 text-muted-foreground" />
                    <span>Категорії</span>
                  </Link>
                  <Link
                    href="/compare"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                    onClick={closeMobileMenu}
                  >
                    <GitCompare className="h-5 w-5 text-muted-foreground" />
                    <span>Порівняння</span>
                    {comparisonItemsCount > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {comparisonItemsCount}
                      </span>
                    )}
                  </Link>
                </nav>

                {/* User Actions */}
                {isAuth && (
                  <nav className="mt-4 pt-4 border-t space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                      Мій акаунт
                    </p>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span>Профіль</span>
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                      onClick={closeMobileMenu}
                    >
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <span>Мої замовлення</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                      onClick={closeMobileMenu}
                    >
                      <Heart className="h-5 w-5 text-muted-foreground" />
                      <span>Список бажань</span>
                      {wishlistItemsCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {wishlistItemsCount}
                        </span>
                      )}
                    </Link>
                    {currentUser?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                        onClick={closeMobileMenu}
                      >
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <span>Адмін панель</span>
                      </Link>
                    )}
                  </nav>
                )}

                {/* Info Links */}
                <nav className="mt-4 pt-4 border-t space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    Інформація
                  </p>
                  <Link
                    href="/about"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                    onClick={closeMobileMenu}
                  >
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <span>Про нас</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-accent"
                    onClick={closeMobileMenu}
                  >
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>Контакти</span>
                  </Link>
                </nav>

                {/* Logout Button */}
                {isAuth && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-red-50 text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Вийти</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
