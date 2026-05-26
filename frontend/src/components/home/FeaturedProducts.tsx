'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import s from './FeaturedProducts.module.css'

const COMPONENT_MAX_RETRIES = 2
const COMPONENT_RETRY_DELAY = 800
// Give up entirely after this many ms so LCP is never blocked beyond it
const COMPONENT_TOTAL_TIMEOUT_MS = 5000

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    // Hard ceiling: if the backend never responds, stop the skeleton after 5s
    const hardTimeout = setTimeout(() => {
      if (!cancelledRef.current) {
        cancelledRef.current = true
        setLoading(false)
      }
    }, COMPONENT_TOTAL_TIMEOUT_MS)

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
        const isNetworkError = !error.response
        // Only retry on timeouts — ECONNREFUSED is immediate and won't self-heal in 800ms.
        const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED'
        if (isNetworkError && isTimeout && attempt < COMPONENT_MAX_RETRIES) {
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
      clearTimeout(hardTimeout)
    }
  }, [])

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
        <div className={s.gridLayout}>
          {products.map((product, i) => (
            <div
              key={product._id}
              className={s.productItem}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

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
