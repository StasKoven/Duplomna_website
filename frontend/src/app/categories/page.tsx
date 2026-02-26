'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { Category } from '@/types'
import { Smartphone, Laptop, Tablet, Watch, Headphones, Camera, Tv, Gamepad2 } from 'lucide-react'
import s from './page.module.css'

const categoryIcons: Record<string, any> = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  smartwatch: Watch,
  headphones: Headphones,
  camera: Camera,
  tv: Tv,
  gaming: Gamepad2,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories', { headers: { 'Cache-Control': 'no-cache' } })
      const incoming = response.data?.categories
      if (Array.isArray(incoming)) {
        setCategories(incoming)
      } else if (response.status === 304) {
        console.log('Categories request 304, keeping previous list')
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`container-custom ${s.page}`}>
        <div className={s.loadingGrid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={s.skeleton}>
              <div className={s.skeletonCard} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.headerSection}>
        <h1 className={s.title}>Категорії товарів</h1>
        <p className={s.subtitle}>
          Оберіть категорію для перегляду всіх доступних товарів
        </p>
      </div>

      <div className={s.gridLayout}>
        {categories.map((category, index) => {
          const IconComponent = categoryIcons[category.slug] || Smartphone

          return (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/products?category=${category._id}`}
                className={`${s.categoryLink} group`}
              >
                <div className={s.categoryCard}>
                  <div className={s.cardContent}>
                    <div className={s.iconWrapper}>
                      <IconComponent className={s.categoryIcon} />
                    </div>
                    <h3 className={s.categoryName}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className={s.categoryDescription}>
                        {category.description}
                      </p>
                    )}
                  </div>

                  {category.image && (
                    <div className={s.hoverOverlay}>
                      <div className={s.overlayBg} />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {categories.length === 0 && !loading && (
        <div className={s.emptyState}>
          <p className={s.emptyText}>Категорії не знайдено</p>
        </div>
      )}
    </div>
  )
}
