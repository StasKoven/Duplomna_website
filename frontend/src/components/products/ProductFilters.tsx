'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import s from './ProductFilters.module.css'

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
    <div className={s.container}>
      {/* Кнопка фільтрів (мобільна версія) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${s.mobileToggle} btn-secondary`}
      >
        <div className={s.toggleContent}>
          <Filter className="h-4 w-4" />
          Фільтри
          {activeFiltersCount > 0 && (
            <span className={s.badge}>
              {activeFiltersCount}
            </span>
          )}
        </div>
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      {/* Секція сортування */}
      <div className={s.sortWrapper}>
        <span className={s.sortLabel}>Сортування:</span>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-')
            handleFilterChange('sortBy', sortBy)
            handleFilterChange('sortOrder', sortOrder)
          }}
          className={`input ${s.sortSelect}`}
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

      {/* Панель фільтрів (анімована) */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={s.filtersPanel}
          >
            <div className={s.filtersCard}>
              {/* Кнопка очищення фільтрів */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className={s.clearButton}
                >
                  <X className="h-4 w-4" />
                  Очистити фільтри ({activeFiltersCount})
                </button>
              )}

              {/* Фільтр за категоріями */}
              <div>
                <h3 className={s.sectionTitle}>Категорія</h3>
                <div className={s.optionsList}>
                  <label className={s.optionLabel}>
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                      className={s.checkInput}
                    />
                    <span className={s.optionText}>Всі категорії</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat._id} className={s.optionLabel}>
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat._id}
                        onChange={() => handleFilterChange('category', cat._id)}
                        className={s.checkInput}
                      />
                      <span className={s.optionText}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Фільтр за ціною */}
              <div>
                <h3 className={s.sectionTitle}>Ціна</h3>
                <div className={s.priceRow}>
                  <input
                    type="number"
                    placeholder="Від"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className={`input ${s.priceInput}`}
                  />
                  <span className={s.priceSeparator}>—</span>
                  <input
                    type="number"
                    placeholder="До"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className={`input ${s.priceInput}`}
                  />
                </div>
              </div>

              {/* Фільтр за наявністю */}
              <div>
                <h3 className={s.sectionTitle}>Наявність</h3>
                <label className={s.optionLabel}>
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className={s.checkInput}
                  />
                  <span className={s.optionText}>Тільки в наявності</span>
                </label>
              </div>

              {/* Фільтр акційних товарів */}
              <div>
                <h3 className={s.sectionTitle}>Акції</h3>
                <label className={s.optionLabel}>
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                    className={s.checkInput}
                  />
                  <span className={s.optionText}>Тільки зі знижкою</span>
                </label>
              </div>

              {/* Фільтр за брендом */}
              <div>
                <h3 className={s.sectionTitle}>Бренд</h3>
                <input
                  type="text"
                  placeholder="Введіть бренд..."
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className={`input ${s.brandInput}`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
