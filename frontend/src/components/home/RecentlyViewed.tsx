'use client'

import { useEffect, useState } from 'react'
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

  return (
    <section className={s.section}>
      <div className="container-custom">
        <div className={s.header}>
          <div className={s.titleRow}>
            <Clock className={s.titleIcon} />
            <h2 className={s.title}>Нещодавно переглянуті</h2>
          </div>
        </div>

        <div className={s.productGrid}>
          {items.slice(0, 8).map((product: Product, i: number) => (
            <div
              key={product._id}
              className={s.productItem}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
