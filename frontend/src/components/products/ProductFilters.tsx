'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

interface Category {
  _id: string
  name: string
  slug: string
}

interface FilterProps {
  onFilterChange?: (filters: any) => void
}

export default function ProductFilters({ onFilterChange }: FilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    brand: searchParams.get('brand') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v !== false) {
        params.set(k, String(v))
      }
    })
    
    const search = searchParams.get('search')
    if (search) params.set('search', search)
    
    router.push(`/products?${params.toString()}`)
    
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      onSale: false,
      brand: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    
    const search = searchParams.get('search')
    if (search) {
      router.push(`/products?search=${search}`)
    } else {
      router.push('/products')
    }
    
    if (onFilterChange) {
      onFilterChange(clearedFilters)
    }
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false
    return value !== '' && value !== false
  }).length

  return (
    <div className="space-y-4">
      {/* ==================== */}
      {/* Mobile Toggle Button */}
      {/* Кнопка для відкриття/закриття фільтрів на мобільних пристроях */}
      {/* ==================== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full btn-secondary flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Фільтри
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      {/* ==================== */}
      {/* Sort Options Section */}
      {/* Секція сортування - завжди видима на всіх пристроях */}
      {/* Опції: новинки, ціна, назва, рейтинг, популярність */}
      {/* ==================== */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium">Сортування:</span>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-')
            handleFilterChange('sortBy', sortBy)
            handleFilterChange('sortOrder', sortOrder)
          }}
          className="input text-sm"
        >
          <option value="createdAt-desc">Новинки</option>
          <option value="price-asc">Ціна: від низької</option>
          <option value="price-desc">Ціна: від високої</option>
          <option value="name-asc">Назва: А-Я</option>
          <option value="name-desc">Назва: Я-А</option>
          <option value="rating-desc">Рейтинг: високий</option>
          <option value="views-desc">Популярні</option>
        </select>
      </div>

      {/* ==================== */}
      {/* Filters Panel Container */}
      {/* Основна панель фільтрів з анімацією відкриття/закриття */}
      {/* Використовує Framer Motion для плавної анімації */}
      {/* ==================== */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden lg:block"
          >
            <div className="bg-card border rounded-lg p-4 space-y-6">
              {/* Clear All Filters Button */}
              {/* Кнопка очищення всіх фільтрів - показується тільки якщо є активні фільтри */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Очистити фільтри ({activeFiltersCount})
                </button>
              )}

              {/* ==================== */}
              {/* Category Filter Section */}
              {/* Фільтр за категоріями товарів */}
              {/* Завантажується динамічно з API */}
              {/* ==================== */}
              <div>
                <h3 className="font-semibold mb-3">Категорія</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                      className="cursor-pointer"
                    />
                    <span className="text-sm">Всі категорії</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat._id}
                        onChange={() => handleFilterChange('category', cat._id)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ==================== */}
              {/* Price Range Filter */}
              {/* Фільтр за діапазоном цін */}
              {/* Мінімальна та максимальна ціна в гривнях */}
              {/* ==================== */}
              <div>
                <h3 className="font-semibold mb-3">Ціна</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Від"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input w-full text-sm"
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="number"
                    placeholder="До"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>
              </div>

              {/* ==================== */}
              {/* Stock Status Filter */}
              {/* Фільтр за наявністю товару */}
              {/* Показувати тільки товари в наявності */}
              {/* ==================== */}
              <div>
                <h3 className="font-semibold mb-3">Наявність</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">Тільки в наявності</span>
                </label>
              </div>

              {/* ==================== */}
              {/* On Sale Filter */}
              {/* Фільтр товарів зі знижкою */}
              {/* Показувати тільки акційні товари */}
              {/* ==================== */}
              <div>
                <h3 className="font-semibold mb-3">Акції</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">Тільки зі знижкою</span>
                </label>
              </div>

              {/* ==================== */}
              {/* Brand Filter */}
              {/* Фільтр за брендом/виробником */}
              {/* Текстовий пошук за назвою бренду */}
              {/* ==================== */}
              <div>
                <h3 className="font-semibold mb-3">Бренд</h3>
                <input
                  type="text"
                  placeholder="Введіть бренд..."
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="input w-full text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
