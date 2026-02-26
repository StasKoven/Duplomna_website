'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { Category } from '@/types'
import s from './Categories.module.css'

const COMPONENT_MAX_RETRIES = 5
const COMPONENT_RETRY_DELAY = 2000

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    const fetchCategories = async (attempt = 0) => {
      try {
        const response = await api.get('/categories')
        if (cancelledRef.current) return
        const incoming = response.data?.categories
        if (Array.isArray(incoming) && incoming.length) {
          setCategories(incoming.slice(0, 6))
        } else {
          setCategories([])
        }
        setLoading(false)
      } catch (error: any) {
        if (cancelledRef.current) return
        console.error('Error fetching categories:', error)
        // If backend isn't ready (network error), retry with delay
        const isNetworkError = !error.response
        if (isNetworkError && attempt < COMPONENT_MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, COMPONENT_RETRY_DELAY))
          if (!cancelledRef.current) {
            return fetchCategories(attempt + 1)
          }
        } else {
          setLoading(false)
        }
      }
    }

    fetchCategories()

    return () => {
      cancelledRef.current = true
    }
  }, [])

  // Анімаційні варіанти
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

  // Стан завантаження (скелетон)
  if (loading) {
    return (
      <section className={s.section}>
        <div className={`container-custom ${s.container}`}>
          <div className={s.header}>
            <div>
              <h2 className={s.title}>Категорії</h2>
              <p className={s.subtitle}>Оберіть те, що вам потрібно</p>
            </div>
          </div>
          <div className={s.gridLayout}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={s.skeleton} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={s.section}>
      <div className={`container-custom ${s.container}`}>
        {/* Заголовок секції */}
        <div className={s.header}>
          <div>
            <h2 className={s.title}>Категорії</h2>
            <p className={s.subtitle}>Оберіть те, що вам потрібно</p>
          </div>
          <Link href="/categories" className={s.viewAllLink}>
            Дивитись всі
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Сітка категорій з анімацією */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={s.gridLayout}
        >
          {categories.map((category) => (
            <motion.div key={category._id} variants={item}>
              <Link
                href={`/products?category=${category._id}`}
                className={`group ${s.categoryLink}`}
              >
                {/* Картка категорії */}
                <div className={s.card}>
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 480px) 33vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className={s.cardImage}
                    />
                  ) : (
                    <div className={s.emojiContainer}>
                      {getCategoryEmoji(category.name)}
                    </div>
                  )}
                  <div className={s.overlay} />
                </div>
                <h3 className={s.categoryName}>
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Мобільне посилання "Дивитись всі" */}
        <div className={s.mobileViewAll}>
          <Link href="/categories" className={s.mobileViewAllLink}>
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
