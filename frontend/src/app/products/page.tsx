'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import api from '@/lib/api'
import { Product, Category } from '@/types'
import ProductCard from '@/components/products/ProductCard'

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
    <div className="space-y-4">
      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 text-sm text-primary hover:underline w-full justify-center py-2 border border-primary rounded-lg"
        >
          <RotateCcw className="h-4 w-4" />
          Скинути фільтри
        </button>
      )}

      {/* Categories */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full p-4 font-semibold hover:bg-accent/50 transition"
        >
          <span>Категорії</span>
          {expandedSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.categories && (
          <div className="px-4 pb-4 space-y-1">
            <button
              onClick={() => handleFilterChange('category', '')}
              className={`block w-full text-left text-sm py-1.5 px-2 rounded transition ${
                !filters.category ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
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
                className={`block w-full text-left text-sm py-1.5 px-2 rounded transition ${
                  filters.category === category._id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full p-4 font-semibold hover:bg-accent/50 transition"
        >
          <span>Ціна</span>
          {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.price && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder={`${priceRange.min}`}
                  value={localPriceMin}
                  onChange={(e) => setLocalPriceMin(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-muted-foreground">—</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder={`${priceRange.max}`}
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Price Range Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={localPriceMin || priceRange.min}
                onChange={(e) => setLocalPriceMin(e.target.value)}
                className="w-full accent-primary"
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={localPriceMax || priceRange.max}
                onChange={(e) => setLocalPriceMax(e.target.value)}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{priceRange.min} ₴</span>
                <span>{priceRange.max} ₴</span>
              </div>
            </div>
            
            <button
              onClick={applyPriceFilter}
              className="w-full py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition"
            >
              Застосувати
            </button>
          </div>
        )}
      </div>

      {/* Brands */}
      {allBrands.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('brands')}
            className="flex items-center justify-between w-full p-4 font-semibold hover:bg-accent/50 transition"
          >
            <span>Бренд</span>
            {expandedSections.brands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {expandedSections.brands && (
            <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto">
              {allBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1.5 rounded transition"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In Stock */}
      <div className="border rounded-lg p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Тільки в наявності</span>
        </label>
      </div>
    </div>
  )

  return (
    <div className="container-custom py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
          {filters.search ? `Результати пошуку: "${filters.search}"` : 'Каталог товарів'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Знайдено {total} товарів
        </p>
        {filters.search && (
          <button
            onClick={() => handleFilterChange('search', '')}
            className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Скинути пошук
          </button>
        )}
      </div>

      {/* Mobile Filter & Sort Bar */}
      <div className="flex gap-2 mb-4 lg:hidden">
        <button
          onClick={() => setIsFilterOpen(true)}
          className={`flex-1 flex items-center justify-center gap-2 border rounded-lg py-2.5 px-4 text-sm font-medium transition ${
            hasActiveFilters ? 'border-primary text-primary' : 'hover:bg-accent'
          }`}
        >
          <Filter className="h-4 w-4" />
          Фільтри
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {[filters.category, filters.minPrice || filters.maxPrice, filters.brands.length > 0, filters.inStock].filter(Boolean).length}
            </span>
          )}
        </button>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="flex-1 border rounded-lg py-2.5 px-4 text-sm font-medium bg-background"
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
      <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
              Скинути всі фільтри
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Сортування:</span>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="border rounded-lg py-2 px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[300px] bg-background z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Фільтри</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-accent rounded-lg transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterSidebar isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {categories.find(c => c._id === filters.category)?.name}
                  <button onClick={() => handleFilterChange('category', '')} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {filters.minPrice || 0} - {filters.maxPrice || '∞'} ₴
                  <button onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); setLocalPriceMin(''); setLocalPriceMax(''); }} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.brands.map(brand => (
                <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {brand}
                  <button onClick={() => handleBrandToggle(brand)} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.inStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  В наявності
                  <button onClick={() => handleFilterChange('inStock', false)} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="rounded-lg bg-muted animate-pulse h-64 sm:h-96" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Товарів не знайдено</h3>
              <p className="text-muted-foreground mb-4">Спробуйте змінити параметри фільтрації</p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  Скинути фільтри
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} compact />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                      page === pageNum 
                        ? 'bg-primary text-primary-foreground' 
                        : 'border hover:bg-accent'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(total / 12), p + 1))}
                disabled={page === Math.ceil(total / 12)}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="container-custom py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg"></div>
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
