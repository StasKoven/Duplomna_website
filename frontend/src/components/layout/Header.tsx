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
import s from './Header.module.css'

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

  // Закриття мобільного меню при зміні маршруту
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
      {/* Основний хедер */}
      <header
        className={cn(
          s.header,
          isScrolled ? s.headerScrolled : s.headerDefault
        )}
        suppressHydrationWarning
      >
        <div className="container-custom" suppressHydrationWarning>
          <div className={s.toolbar}>
            {/* Кнопка мобільного меню */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={s.mobileMenuBtn}
              aria-label="Меню"
            >
              {isMobileMenuOpen ? <X className={s.icon} /> : <Menu className={s.icon} />}
            </button>

            {/* Логотип */}
            <Link href="/" className={s.logo}>
              <ShoppingBag className={s.iconLogo} />
              <span className={s.logoText}>TechStore</span>
            </Link>

            {/* Десктоп навігація */}
            <nav className={s.desktopNav}>
              <Link href="/products" className={s.navLink}>
                Каталог
              </Link>
              <Link href="/categories" className={s.navLink}>
                Категорії
              </Link>
              <Link href="/about" className={s.navLink}>
                Про нас
              </Link>
              <Link href="/contact" className={s.navLink}>
                Контакти
              </Link>
            </nav>

            {/* Десктоп пошук */}
            <form onSubmit={handleSearch} className={s.searchForm}>
              <div className={s.searchWrapper}>
                <Search className={s.searchIcon} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук товарів..."
                  className={s.searchInput}
                />
              </div>
            </form>

            {/* Секція дій (праворуч) */}
            <div className={s.actions}>
              {/* Мобільний пошук — кнопка */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={s.mobileSearchBtn}
                aria-label="Пошук"
              >
                <Search className={s.icon} />
              </button>

              {/* Порівняння */}
              <Link href="/compare" className={s.compareBtn}>
                <GitCompare className={s.icon} />
                {comparisonItemsCount > 0 && (
                  <span className={s.badgeBlue}>
                    {comparisonItemsCount}
                  </span>
                )}
              </Link>

              {/* Список бажань */}
              <Link href="/wishlist" className={s.actionBtn}>
                <Heart className={s.icon} />
                {wishlistItemsCount > 0 && (
                  <span className={s.badgeRed}>
                    {wishlistItemsCount}
                  </span>
                )}
              </Link>

              {/* Кошик */}
              <Link href="/cart" className={s.actionBtn}>
                <ShoppingCart className={s.icon} />
                {cartItemsCount > 0 && (
                  <span className={s.badgePrimary}>
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Меню користувача — десктоп */}
              <div className={s.userMenuContainer}>
                {isAuth ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={s.userMenuBtn}
                    >
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.firstName || ''}
                          className={s.userAvatar}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={s.userAvatarPlaceholder}>
                          {currentUser?.firstName?.[0]}
                        </div>
                      )}
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          <div 
                            className={s.userMenuOverlay} 
                            onClick={() => setIsUserMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={s.userDropdown}
                          >
                            <div className={s.userInfo}>
                              <p className={s.userName}>{currentUser?.firstName} {currentUser?.lastName}</p>
                              <p className={s.userEmail}>{currentUser?.email}</p>
                            </div>

                            <Link
                              href="/profile"
                              className={s.dropdownLink}
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User className={s.iconSm} />
                              <span>Профіль</span>
                            </Link>

                            <Link
                              href="/orders"
                              className={s.dropdownLink}
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Package className={s.iconSm} />
                              <span>Замовлення</span>
                            </Link>

                            {currentUser?.role === 'admin' && (
                              <Link
                                href="/admin"
                                className={s.dropdownLink}
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Settings className={s.iconSm} />
                                <span>Адмін панель</span>
                              </Link>
                            )}

                            <button
                              onClick={handleLogout}
                              className={s.logoutBtn}
                            >
                              <LogOut className={s.iconSm} />
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
                    className={s.loginLink}
                  >
                    <User className={s.icon} />
                    <span className={s.loginText}>Увійти</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Мобільний пошук — розгорнутий */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={s.mobileSearchSection}
              >
                <form onSubmit={handleSearch}>
                  <div className={s.searchWrapper}>
                    <Search className={s.searchIcon} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Пошук товарів..."
                      autoFocus
                      className={s.mobileSearchInput}
                    />
                    <button
                      type="button"
                      onClick={() => setIsMobileSearchOpen(false)}
                      className={s.mobileSearchClose}
                    >
                      <X className={s.iconMutedSm} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Мобільне меню — повноекранний оверлей */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={s.mobileOverlay}
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={s.mobilePanel}
            >
              <div className={s.mobilePanelContent}>
                {/* Секція користувача — мобільна */}
                {isAuth ? (
                  <div className={s.mobileUserSection}>
                    <div className={s.mobileUserFlex}>
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.firstName || ''}
                          className={s.mobileAvatar}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={s.mobileAvatarPlaceholder}>
                          {currentUser?.firstName?.[0]}
                        </div>
                      )}
                      <div className={s.mobileUserInfo}>
                        <p className={s.mobileUserName}>{currentUser?.firstName} {currentUser?.lastName}</p>
                        <p className={s.mobileUserEmail}>{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className={s.mobileLoginLink}
                    onClick={closeMobileMenu}
                  >
                    <User className={s.icon} />
                    <span className={s.userName}>Увійти в акаунт</span>
                  </Link>
                )}

                {/* Навігаційні посилання */}
                <nav className={s.mobileNav}>
                  <p className={s.sectionLabel}>
                    Меню
                  </p>
                  <Link
                    href="/"
                    className={s.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    <Home className={s.iconMuted} />
                    <span>Головна</span>
                  </Link>
                  <Link
                    href="/products"
                    className={s.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    <ShoppingBag className={s.iconMuted} />
                    <span>Каталог</span>
                  </Link>
                  <Link
                    href="/categories"
                    className={s.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    <Grid3X3 className={s.iconMuted} />
                    <span>Категорії</span>
                  </Link>
                  <Link
                    href="/compare"
                    className={s.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    <GitCompare className={s.iconMuted} />
                    <span>Порівняння</span>
                    {comparisonItemsCount > 0 && (
                      <span className={s.mobileBadgeBlue}>
                        {comparisonItemsCount}
                      </span>
                    )}
                  </Link>
                </nav>

                {/* Дії користувача */}
                {isAuth && (
                  <nav className={s.userActionsNav}>
                    <p className={s.sectionLabel}>
                      Мій акаунт
                    </p>
                    <Link
                      href="/profile"
                      className={s.mobileNavLink}
                      onClick={closeMobileMenu}
                    >
                      <User className={s.iconMuted} />
                      <span>Профіль</span>
                    </Link>
                    <Link
                      href="/orders"
                      className={s.mobileNavLink}
                      onClick={closeMobileMenu}
                    >
                      <Package className={s.iconMuted} />
                      <span>Мої замовлення</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className={s.mobileNavLink}
                      onClick={closeMobileMenu}
                    >
                      <Heart className={s.iconMuted} />
                      <span>Список бажань</span>
                      {wishlistItemsCount > 0 && (
                        <span className={s.mobileBadgeRed}>
                          {wishlistItemsCount}
                        </span>
                      )}
                    </Link>
                    {currentUser?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className={s.mobileNavLink}
                        onClick={closeMobileMenu}
                      >
                        <Settings className={s.iconMuted} />
                        <span>Адмін панель</span>
                      </Link>
                    )}
                  </nav>
                )}

                {/* Інформаційні посилання */}
                <nav className={s.infoNav}>
                  <p className={s.sectionLabel}>
                    Інформація
                  </p>
                  <Link
                    href="/about"
                    className={s.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    <Info className={s.iconMuted} />
                    <span>Про нас</span>
                  </Link>
                  <Link
                    href="/contact"
                    className={s.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    <Phone className={s.iconMuted} />
                    <span>Контакти</span>
                  </Link>
                </nav>

                {/* Кнопка виходу */}
                {isAuth && (
                  <div className={s.logoutSection}>
                    <button
                      onClick={handleLogout}
                      className={s.mobileLogoutBtn}
                    >
                      <LogOut className={s.icon} />
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
