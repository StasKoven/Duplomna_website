'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { Category } from '@/types'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      const incoming = response.data?.categories
      if (Array.isArray(incoming) && incoming.length) {
        setCategories(incoming.slice(0, 6))
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Категорії</h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Оберіть те, що вам потрібно</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Категорії</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Оберіть те, що вам потрібно</p>
          </div>
          <Link 
            href="/categories" 
            className="hidden sm:flex items-center text-sm font-medium text-primary hover:underline"
          >
            Дивитись всі
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {categories.map((category) => (
            <motion.div key={category._id} variants={item}>
              <Link
                href={`/products?category=${category._id}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-lg sm:rounded-xl bg-background border overflow-hidden transition-all hover:shadow-lg active:scale-95 sm:hover:scale-105">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 480px) 33vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl sm:text-5xl md:text-6xl">
                      {getCategoryEmoji(category.name)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-center group-hover:text-primary transition-colors line-clamp-1">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ==================== */}
        {/* Mobile "View All" Link */}
        {/* Кнопка для перегляду всіх категорій */}
        {/* Видима тільки на мобільних пристроях */}
        {/* ==================== */}
        <div className="mt-4 sm:hidden text-center">
          <Link 
            href="/categories" 
            className="inline-flex items-center text-sm font-medium text-primary"
          >
            Дивитись всі категорії
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function getCategoryEmoji(name: string): string {
  const emojiMap: Record<string, string> = {
    'Smartphones': '📱',
    'Laptops': '💻',
    'Tablets': '📲',
    'Smartwatches': '⌚',
    'Headphones': '🎧',
    'Cameras': '📷',
    'Gaming': '🎮',
    'Accessories': '🔌',
  }
  return emojiMap[name] || '📦'
}
