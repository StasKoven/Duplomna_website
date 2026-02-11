'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products/featured?limit=8')
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching featured products:', error)
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
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Рекомендовані товари</h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Найкращі пропозиції цього тижня</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-lg bg-muted animate-pulse aspect-[3/4] sm:h-96" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Рекомендовані товари</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Найкращі пропозиції цього тижня</p>
          </div>
          <Link 
            href="/products?featured=true" 
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
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        >
          {products.map((product) => (
            <motion.div key={product._id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* ==================== */}
        {/* Mobile "View All" Link */}
        {/* Кнопка "Дивитись всі" для мобільних */}
        {/* Видима тільки на екранах < sm */}
        {/* ==================== */}
        <div className="mt-6 sm:hidden text-center">
          <Link 
            href="/products?featured=true" 
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/5"
          >
            Дивитись всі товари
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
