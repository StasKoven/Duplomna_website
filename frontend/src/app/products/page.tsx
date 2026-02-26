'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import api from '@/lib/api'
import { Product, Category } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import s from './page.module.css'

interface Filters {
  category: string
  minPrice: string
  maxPrice: string
  brands: string[]
  sort: string
  inStock: boolean
  search: string
}

function ProductsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [allBrands, setAllBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
  })

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brands: searchParams.get('brand')?.split(',').filter(Boolean) || [],
    sort: searchParams.get('sort') || 'newest',
    inStock: searchParams.get('inStock') === 'true',
    search: searchParams.get('search') || '',
  })

  // Local price inputs (before applying)
  const [localPriceMin, setLocalPriceMin] = useState(filters.minPrice)
  const [localPriceMax, setLocalPriceMax] = useState(filters.maxPrice)

  // Update URL with filters
  const updateURL = useCallback((newFilters: Filters) => {
    const params = new URLSearchParams()
    
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice)
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice)
    if (newFilters.brands.length > 0) params.set('brand', newFilters.brands.join(','))
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort)
    if (newFilters.inStock) params.set('inStock', 'true')
    
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [router, pathname])

  // Sync filters with URL params (for search from Header)
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const brands = searchParams.get('brand')?.split(',').filter(Boolean) || []
    const sort = searchParams.get('sort') || 'newest'
    const inStock = searchParams.get('inStock') === 'true'

    setFilters({ search, category, minPrice, maxPrice, brands, sort, inStock })
    setLocalPriceMin(minPrice)
    setLocalPriceMax(maxPrice)
    setPage(1)
  }, [searchParams])

  // Fetch categories and brands
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catResponse, productsResponse] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=1000')
        ])
        
        setCategories(catResponse.data.categories)
        
        // Extract unique brands
        const brands = [...new Set(
          productsResponse.data.products
            .map((p: Product) => p.brand)
            .filter(Boolean)
        )] as string[]
        setAllBrands(brands.sort())
        
        // Get price range
        const prices = productsResponse.data.products.map((p: Product) => p.price)
        if (prices.length > 0) {
          setPriceRange({
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
          })
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
      }
    }
    
    fetchInitialData()
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        params.set('page', page.toString())
        params.set('limit', '12')
        
        if (filters.search) params.set('search', filters.search)
        if (filters.category) params.set('category', filters.category)
        if (filters.minPrice) params.set('minPrice', filters.minPrice)
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
        if (filters.brands.length > 0) params.set('brand', filters.brands.join(','))
        if (filters.inStock) params.set('inStock', 'true')
        
        // Sort mapping
        const sortMap: Record<string, string> = {
          'newest': '-createdAt',
          'oldest': 'createdAt',
          'price-asc': 'price',
          'price-desc': '-price',
          'name-asc': 'name',
          'name-desc': '-name',
          'popular': '-rating.count'
        }
        params.set('sort', sortMap[filters.sort] || '-createdAt')

        const response = await api.get(`/products?${params}`)
        setProducts(response.data.products)
        setTotal(response.data.pagination.total)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters, page])

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setPage(1)
    updateURL(newFilters)
  }

  // Handle brand toggle
  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand]
    handleFilterChange('brands', newBrands)
  }

  // Apply price filter
  const applyPriceFilter = () => {
    const newFilters = {
      ...filters,
      minPrice: localPriceMin,
      maxPrice: localPriceMax
    }
    setFilters(newFilters)
    setPage(1)
    updateURL(newFilters)
  }

  // Reset all filters
  const resetFilters = () => {
    const defaultFilters: Filters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      brands: [],
      sort: 'newest',
      inStock: false,
      search: '',
    }
    setFilters(defaultFilters)
    setLocalPriceMin('')
    setLocalPriceMax('')
    setPage(1)
    router.push(pathname, { scroll: false })
  }

  // Check if any filters are active
  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || 
    filters.brands.length > 0 || filters.inStock

  // Toggle section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={s.filterSidebar}>
      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className={s.resetFiltersBtn}
        >
          <RotateCcw className={s.iconSm} />
          Скинути фільтри
        </button>
      )}

      {/* Categories */}
      <div className={s.filterSection}>
        <button
          onClick={() => toggleSection('categories')}
          className={s.sectionToggle}
        >
          <span>Категорії</span>
          {expandedSections.categories ? <ChevronUp className={s.iconSm} /> : <ChevronDown className={s.iconSm} />}
        </button>
        {expandedSections.categories && (
          <div className={s.categoryList}>
            <button
              onClick={() => handleFilterChange('category', '')}
              className={`${s.categoryItem} ${
                !filters.category ? s.categoryItemActive : s.categoryItemInactive
              }`}
            >
              Всі категорії
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => {
                  handleFilterChange('category', category._id)
                  if (isMobile) setIsFilterOpen(false)
                }}
                className={`${s.categoryItem} ${
                  filters.category === category._id ? s.categoryItemActive : s.categoryItemInactive
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className={s.filterSection}>
        <button
          onClick={() => toggleSection('price')}
          className={s.sectionToggle}
        >
          <span>Ціна</span>
          {expandedSections.price ? <ChevronUp className={s.iconSm} /> : <ChevronDown className={s.iconSm} />}
        </button>
        {expandedSections.price && (
          <div className={s.priceBody}>
            <div className={s.priceInputRow}>
              <div className={s.priceInputWrapper}>
                <input
                  type="number"
                  placeholder={`${priceRange.min}`}
                  value={localPriceMin}
                  onChange={(e) => setLocalPriceMin(e.target.value)}
                  className={s.priceInput}
                />
              </div>
              <span className={s.priceSeparator}>—</span>
              <div className={s.priceInputWrapper}>
                <input
                  type="number"
                  placeholder={`${priceRange.max}`}
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                  className={s.priceInput}
                />
              </div>
            </div>
            
            {/* Price Range Slider */}
            <div className={s.priceSliderSection}>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={localPriceMin || priceRange.min}
                onChange={(e) => setLocalPriceMin(e.target.value)}
                className={s.priceSlider}
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={localPriceMax || priceRange.max}
                onChange={(e) => setLocalPriceMax(e.target.value)}
                className={s.priceSlider}
              />
              <div className={s.priceRangeLabels}>
                <span>{priceRange.min} ₴</span>
                <span>{priceRange.max} ₴</span>
              </div>
            </div>
            
            <button
              onClick={applyPriceFilter}
              className={s.applyPriceBtn}
            >
              Застосувати
            </button>
          </div>
        )}
      </div>

      {/* Brands */}
      {allBrands.length > 0 && (
        <div className={s.filterSection}>
          <button
            onClick={() => toggleSection('brands')}
            className={s.sectionToggle}
          >
            <span>Бренд</span>
            {expandedSections.brands ? <ChevronUp className={s.iconSm} /> : <ChevronDown className={s.iconSm} />}
          </button>
          {expandedSections.brands && (
            <div className={s.brandList}>
              {allBrands.map((brand) => (
                <label
                  key={brand}
                  className={s.brandLabel}
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className={s.checkbox}
                  />
                  <span className={s.brandText}>{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In Stock */}
      <div className={s.stockSection}>
        <label className={s.stockLabel}>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className={s.checkbox}
          />
          <span className={s.stockText}>Тільки в наявності</span>
        </label>
      </div>
    </div>
  )

  return (
    <div className={`container-custom ${s.pageContainer}`}>
      {/* Header */}
      <div className={s.header}>
        <h1 className={s.title}>
          {filters.search ? `Результати пошуку: "${filters.search}"` : 'Каталог товарів'}
        </h1>
        <p className={s.subtitle}>
          Знайдено {total} товарів
        </p>
        {filters.search && (
          <button
            onClick={() => handleFilterChange('search', '')}
            className={s.clearSearchBtn}
          >
            <X className={s.iconSm} />
            Скинути пошук
          </button>
        )}
      </div>

      {/* Mobile Filter & Sort Bar */}
      <div className={s.mobileBar}>
        <button
          onClick={() => setIsFilterOpen(true)}
          className={`${s.mobileFilterBtn} ${
            hasActiveFilters ? s.mobileFilterBtnActive : s.mobileFilterBtnInactive
          }`}
        >
          <Filter className={s.iconSm} />
          Фільтри
          {hasActiveFilters && (
            <span className={s.filterBadge}>
              {[filters.category, filters.minPrice || filters.maxPrice, filters.brands.length > 0, filters.inStock].filter(Boolean).length}
            </span>
          )}
        </button>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className={s.mobileSortSelect}
        >
          <option value="newest">Новинки</option>
          <option value="popular">Популярні</option>
          <option value="price-asc">Дешевші</option>
          <option value="price-desc">Дорожчі</option>
          <option value="name-asc">А-Я</option>
          <option value="name-desc">Я-А</option>
        </select>
      </div>

      {/* Desktop Sort Bar */}
      <div className={s.desktopSortBar}>
        <div className={s.sortBarLeft}>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className={s.resetAllBtn}
            >
              <X className={s.iconSm} />
              Скинути всі фільтри
            </button>
          )}
        </div>
        <div className={s.sortBarRight}>
          <span className={s.sortLabel}>Сортування:</span>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className={s.desktopSortSelect}
          >
            <option value="newest">Новинки</option>
            <option value="popular">Популярні</option>
            <option value="price-asc">Від дешевих до дорогих</option>
            <option value="price-desc">Від дорогих до дешевих</option>
            <option value="name-asc">За назвою А-Я</option>
            <option value="name-desc">За назвою Я-А</option>
          </select>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={s.drawerOverlay}
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={s.drawerPanel}
            >
              <div className={s.drawerContent}>
                <div className={s.drawerHeader}>
                  <h2 className={s.drawerTitle}>Фільтри</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className={s.drawerCloseBtn}
                  >
                    <X className={s.iconMd} />
                  </button>
                </div>
                <FilterSidebar isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={s.mainGrid}>
        {/* Desktop Filters Sidebar */}
        <aside className={s.desktopSidebar}>
          <div className={s.sidebarSticky}>
            <FilterSidebar />
          </div>
        </aside>

        {/* Products Grid */}
        <div className={s.productsColumn}>
          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className={s.activeFilterTags}>
              {filters.category && (
                <span className={s.filterTag}>
                  {categories.find(c => c._id === filters.category)?.name}
                  <button onClick={() => handleFilterChange('category', '')} className={s.tagRemoveBtn}>
                    <X className={s.iconXs} />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className={s.filterTag}>
                  {filters.minPrice || 0} - {filters.maxPrice || '∞'} ₴
                  <button onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); setLocalPriceMin(''); setLocalPriceMax(''); }} className={s.tagRemoveBtn}>
                    <X className={s.iconXs} />
                  </button>
                </span>
              )}
              {filters.brands.map(brand => (
                <span key={brand} className={s.filterTag}>
                  {brand}
                  <button onClick={() => handleBrandToggle(brand)} className={s.tagRemoveBtn}>
                    <X className={s.iconXs} />
                  </button>
                </span>
              ))}
              {filters.inStock && (
                <span className={s.filterTag}>
                  В наявності
                  <button onClick={() => handleFilterChange('inStock', false)} className={s.tagRemoveBtn}>
                    <X className={s.iconXs} />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className={s.productsGrid}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className={s.skeletonCard} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>🔍</div>
              <h3 className={s.emptyTitle}>Товарів не знайдено</h3>
              <p className={s.emptyText}>Спробуйте змінити параметри фільтрації</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className={s.emptyResetBtn}
                >
                  <RotateCcw className={s.iconSm} />
                  Скинути фільтри
                </button>
              )}
            </div>
          ) : (
            <div className={s.productsGrid}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} compact />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className={s.pagination}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={s.paginationArrow}
              >
                ←
              </button>
              
              {Array.from({ length: Math.min(5, Math.ceil(total / 12)) }, (_, i) => {
                const totalPages = Math.ceil(total / 12)
                let pageNum: number
                
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`${s.paginationPage} ${
                      page === pageNum 
                        ? s.paginationPageActive 
                        : s.paginationPageInactive
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(total / 12), p + 1))}
                disabled={page === Math.ceil(total / 12)}
                className={s.paginationArrow}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductsLoading() {
  return (
    <div className={`container-custom ${s.loadingContainer}`}>
      <div className={s.loadingPulse}>
        <div className={s.loadingTitle}></div>
        <div className={s.loadingGrid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={s.loadingCard}></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  )
}
