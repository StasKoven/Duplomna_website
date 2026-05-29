'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  Heart,
  Monitor,
  LogOut,
  Settings,
  Package,
  ArrowLeftRight,
  Home,
  LayoutGrid,
  Info,
  Phone
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useComparisonStore } from '@/store/comparisonStore'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import s from './Header.module.css'

interface SearchResult {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: { url: string; alt?: string }[]
  brand?: string
  stock?: number
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const { getTotalItems: getWishlistTotal } = useWishlistStore()
  const { getTotalItems: getComparisonTotal } = useComparisonStore()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounced live search for dropdown
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { data } = await api.get(`/products/autocomplete?q=${encodeURIComponent(searchQuery)}`)
        setSearchResults(data.products || [])
        setShowSearchDropdown(true)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 280)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      const outsideDesktop = searchContainerRef.current && !searchContainerRef.current.contains(target)
      const outsideMobile = mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(target)
      if (outsideDesktop && outsideMobile) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close dropdown on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowSearchDropdown(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSearchDropdown(false)
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMobileSearchOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  const closeDropdownAndNavigate = () => {
    setShowSearchDropdown(false)
    setSearchQuery('')
    setIsMobileSearchOpen(false)
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
              <Monitor className={s.iconLogo} />
              <span className={s.logoText}>Tech<span className={s.logoAccent}>Store</span></span>
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
            <div ref={searchContainerRef} className={s.searchContainer}>
              <form onSubmit={handleSearch} className={s.searchForm}>
                <div className={s.searchWrapper}>
                  <Search className={s.searchIcon} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Пошук товарів..."
                    className={s.searchInput}
                    autoComplete="off"
                  />
                </div>
              </form>
              {/* Live search dropdown */}
              {showSearchDropdown && (
                <div className={s.searchDropdown}>
                  {isSearching ? (
                    <div className={s.searchDropdownState}>Пошук...</div>
                  ) : searchResults.length === 0 ? (
                    <div className={s.searchDropdownState}>Нічого не знайдено за запитом &ldquo;{searchQuery}&rdquo;</div>
                  ) : (
                    <>
                      <div className={s.searchDropdownHeader}>Товари ({searchResults.length})</div>
                      {searchResults.map((product) => {
                        const hasDiscount = product.comparePrice && product.comparePrice > product.price
                        const discountPct = hasDiscount ? Math.round((1 - product.price / product.comparePrice!) * 100) : 0
                        return (
                          <Link
                            key={product._id}
                            href={`/products/${product.slug}`}
                            className={s.searchDropdownItem}
                            onClick={closeDropdownAndNavigate}
                          >
                            <div className={s.searchDropdownImgWrap}>
                              {product.images?.[0]?.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className={s.searchDropdownImg}
                                  loading="lazy"
                                />
                              ) : (
                                <div className={s.searchDropdownImgPlaceholder}>📦</div>
                              )}
                              {hasDiscount && (
                                <span className={s.searchDropdownBadge}>-{discountPct}%</span>
                              )}
                            </div>
                            <div className={s.searchDropdownInfo}>
                              <span className={s.searchDropdownName}>{product.name}</span>
                              {product.brand && <span className={s.searchDropdownBrand}>{product.brand}</span>}
                            </div>
                            <div className={s.searchDropdownPriceCol}>
                              <span className={s.searchDropdownPrice}>{formatPrice(product.price)}</span>
                              {hasDiscount && (
                                <span className={s.searchDropdownComparePrice}>{formatPrice(product.comparePrice!)}</span>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                      <Link
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        className={s.searchDropdownAll}
                        onClick={closeDropdownAndNavigate}
                      >
                        Показати всі результати &rarr;
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

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

              {/* Перемикач теми */}
              <ThemeToggle />

              {/* Порівняння */}
              <Link href="/compare" className={s.compareBtn} aria-label="Порівняння товарів">
                <ArrowLeftRight className={s.icon} />
                {comparisonItemsCount > 0 && (
                  <span className={s.badgeBlue}>
                    {comparisonItemsCount}
                  </span>
                )}
              </Link>

              {/* Список бажань */}
              <Link href="/wishlist" className={s.actionBtn} aria-label="Список бажань">
                <Heart className={s.icon} />
                {wishlistItemsCount > 0 && (
                  <span className={s.badgeRed}>
                    {wishlistItemsCount}
                  </span>
                )}
              </Link>

              {/* Сповіщення */}
              <NotificationBell />

              {/* Кошик */}
              <Link href="/cart" className={s.actionBtn} aria-label="Кошик">
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
                      aria-label="Профіль користувача"
                    >
                      {currentUser?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
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

                    {isUserMenuOpen && (
                        <>
                          <div
                            className={s.userMenuOverlay}
                            onClick={() => setIsUserMenuOpen(false)}
                          />
                          <div className={`${s.userDropdown} ${s.userDropdownEnter}`}>
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
                          </div>
                        </>
                      )}
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
            {isMobileSearchOpen && (
              <div className={`${s.mobileSearchSection} ${s.mobileSearchEnter}`}>
                <div ref={mobileSearchContainerRef} style={{ position: 'relative' }}>
                  <form onSubmit={handleSearch}>
                    <div className={s.searchWrapper}>
                      <Search className={s.searchIcon} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Пошук товарів..."
                        autoFocus
                        autoComplete="off"
                        className={s.mobileSearchInput}
                      />
                      <button
                        type="button"
                        onClick={() => { setIsMobileSearchOpen(false); setShowSearchDropdown(false) }}
                        className={s.mobileSearchClose}
                        aria-label="Закрити пошук"
                      >
                        <X className={s.iconMutedSm} />
                      </button>
                    </div>
                  </form>
                  {/* Mobile live search dropdown */}
                  {showSearchDropdown && (
                    <div className={s.searchDropdown}>
                      {isSearching ? (
                        <div className={s.searchDropdownState}>Пошук...</div>
                      ) : searchResults.length === 0 ? (
                        <div className={s.searchDropdownState}>Нічого не знайдено за запитом &ldquo;{searchQuery}&rdquo;</div>
                      ) : (
                        <>
                          <div className={s.searchDropdownHeader}>Товари ({searchResults.length})</div>
                          {searchResults.map((product) => {
                            const hasDiscount = product.comparePrice && product.comparePrice > product.price
                            const discountPct = hasDiscount ? Math.round((1 - product.price / product.comparePrice!) * 100) : 0
                            return (
                              <Link
                                key={product._id}
                                href={`/products/${product.slug}`}
                                className={s.searchDropdownItem}
                                onClick={closeDropdownAndNavigate}
                              >
                                <div className={s.searchDropdownImgWrap}>
                                  {product.images?.[0]?.url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={product.images[0].url}
                                      alt={product.name}
                                      className={s.searchDropdownImg}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className={s.searchDropdownImgPlaceholder}>📦</div>
                                  )}
                                  {hasDiscount && (
                                    <span className={s.searchDropdownBadge}>-{discountPct}%</span>
                                  )}
                                </div>
                                <div className={s.searchDropdownInfo}>
                                  <span className={s.searchDropdownName}>{product.name}</span>
                                  {product.brand && <span className={s.searchDropdownBrand}>{product.brand}</span>}
                                </div>
                                <div className={s.searchDropdownPriceCol}>
                                  <span className={s.searchDropdownPrice}>{formatPrice(product.price)}</span>
                                  {hasDiscount && (
                                    <span className={s.searchDropdownComparePrice}>{formatPrice(product.comparePrice!)}</span>
                                  )}
                                </div>
                              </Link>
                            )
                          })}
                          <Link
                            href={`/products?search=${encodeURIComponent(searchQuery)}`}
                            className={s.searchDropdownAll}
                            onClick={closeDropdownAndNavigate}
                          >
                            Показати всі результати &rarr;
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </header>

      {/* Мобільне меню — повноекранний оверлей */}
        {isMobileMenuOpen && (
          <>
            <div
              className={`${s.mobileOverlay} ${s.mobileOverlayEnter}`}
              onClick={closeMobileMenu}
            />
            <div className={`${s.mobilePanel} ${s.mobilePanelEnter}`}>
              <div className={s.mobilePanelContent}>
                {/* Секція користувача — мобільна */}
                {isAuth ? (
                  <div className={s.mobileUserSection}>
                    <div className={s.mobileUserFlex}>
                      {currentUser?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
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
                    <Search className={s.iconMuted} />
                    <span>Каталог</span>
                  </Link>
                  <Link
                    href="/categories"
                    className={s.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    <LayoutGrid className={s.iconMuted} />
                    <span>Категорії</span>
                  </Link>
                  <Link
                    href="/compare"
                    className={s.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    <ArrowLeftRight className={s.iconMuted} />
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
                  <div className={s.mobileNavLink} style={{ cursor: 'default' }}>
                    <span style={{ flex: 1 }}>Тема оформлення</span>
                    <ThemeToggle />
                  </div>
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
            </div>
          </>
        )}
    </>
  )
}
