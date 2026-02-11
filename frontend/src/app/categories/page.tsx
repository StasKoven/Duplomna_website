'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { Category } from '@/types'
import { Smartphone, Laptop, Tablet, Watch, Headphones, Camera, Tv, Gamepad2 } from 'lucide-react'

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
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Категорії товарів</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Оберіть категорію для перегляду всіх доступних товарів
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                className="group block"
              >
                <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="mb-4 p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {category.image && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-primary" />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Категорії не знайдено</p>
        </div>
      )}
    </div>
  )
}
