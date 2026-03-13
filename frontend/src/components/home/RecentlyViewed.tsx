'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore'
import { Product } from '@/types'
import s from './RecentlyViewed.module.css'

export default function RecentlyViewed() {
  const [mounted, setMounted] = useState(false)
  const items = useRecentlyViewedStore((s) => s.items)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || items.length === 0) return null

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className={s.section}>
      <div className="container-custom">
        <div className={s.header}>
          <div className={s.titleRow}>
            <Clock className={s.titleIcon} />
            <h2 className={s.title}>Нещодавно переглянуті</h2>
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={s.productGrid}
        >
          {items.slice(0, 8).map((product: Product) => (
            <motion.div key={product._id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
