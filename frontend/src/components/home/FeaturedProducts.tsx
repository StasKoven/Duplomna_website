'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import s from './FeaturedProducts.module.css'

const COMPONENT_MAX_RETRIES = 5
const COMPONENT_RETRY_DELAY = 2000

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    const fetchFeaturedProducts = async (attempt = 0) => {
      try {
        const response = await api.get('/products/featured?limit=8')
        if (!cancelledRef.current) {
          setProducts(response.data.products || [])
          setLoading(false)
        }
      } catch (error: any) {
        if (cancelledRef.current) return
        console.error('Error fetching featured products:', error)
        // If backend isn't ready (network error), retry with delay
        const isNetworkError = !error.response
        if (isNetworkError && attempt < COMPONENT_MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, COMPONENT_RETRY_DELAY))
          if (!cancelledRef.current) {
            return fetchFeaturedProducts(attempt + 1)
          }
        } else {
          setLoading(false)
        }
      }
    }

    fetchFeaturedProducts()

    return () => {
      cancelledRef.current = true
    }
  }, [])

  // Анімація контейнера
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  // Анімація елемента
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // Стан завантаження — скелетон
  if (loading) {
    return (
      <section className={s.section}>
        <div className="container-custom">
          <div className={s.header}>
            <div>
              <h2 className={s.title}>Рекомендовані товари</h2>
              <p className={s.subtitle}>Найкращі пропозиції цього тижня</p>
            </div>
          </div>
          <div className={s.gridLayout}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={s.skeleton} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={s.section}>
      <div className="container-custom">
        {/* Заголовок секції */}
        <div className={s.header}>
          <div>
            <h2 className={s.title}>Рекомендовані товари</h2>
            <p className={s.subtitle}>Найкращі пропозиції цього тижня</p>
          </div>
          {/* Посилання "Дивитись всі" — десктоп */}
          <Link 
            href="/products?featured=true" 
            className={s.viewAllDesktop}
          >
            Дивитись всі
            <ArrowRight className={s.arrowIconDesktop} />
          </Link>
        </div>

        {/* Сітка товарів з анімацією */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={s.gridLayout}
        >
          {products.map((product) => (
            <motion.div key={product._id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Кнопка "Дивитись всі" для мобільних */}
        <div className={s.mobileLink}>
          <Link 
            href="/products?featured=true" 
            className={s.viewAllMobile}
          >
            Дивитись всі товари
            <ArrowRight className={s.arrowIconMobile} />
          </Link>
        </div>
      </div>
    </section>
  )
}
