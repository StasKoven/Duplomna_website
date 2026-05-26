'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Category } from '@/types'
import * as LucideIcons from 'lucide-react'
import { Smartphone, Laptop, Tablet, Watch, Headphones, Camera, Tv, Gamepad2 } from 'lucide-react'
import s from './page.module.css'

// Resolve a category to a Lucide icon by either its `icon` field (admin-set
// Lucide name) or a slug-based fallback. Unknown values fall back to Smartphone
// so empty/Cyrillic-named categories still render a sensible tile.
const slugIcons: Record<string, any> = {
  smartphone: Smartphone,
  smartphones: Smartphone,
  laptop: Laptop,
  laptops: Laptop,
  tablet: Tablet,
  tablets: Tablet,
  smartwatch: Watch,
  smartwatches: Watch,
  headphones: Headphones,
  camera: Camera,
  cameras: Camera,
  tv: Tv,
  gaming: Gamepad2,
}

function resolveIcon(category: { icon?: string | null; slug?: string }) {
  if (category.icon && (LucideIcons as any)[category.icon]) {
    return (LucideIcons as any)[category.icon]
  }
  if (category.slug && slugIcons[category.slug.toLowerCase()]) {
    return slugIcons[category.slug.toLowerCase()]
  }
  return Smartphone
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
          const IconComponent = resolveIcon(category as any)

          return (
            <div
              key={category._id}
              className={s.categoryItem}
              style={{ animationDelay: `${index * 0.1}s` }}
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
            </div>
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
