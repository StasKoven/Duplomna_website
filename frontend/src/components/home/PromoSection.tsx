'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Percent, Package, Clock } from 'lucide-react'

export default function PromoSection() {
  const promos = [
    {
      icon: <Percent className="h-8 w-8" />,
      title: 'Знижки до 50%',
      description: 'На обрані моделі смартфонів',
      link: '/products?onSale=true',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: 'Безкоштовна доставка',
      description: 'При замовленні від 1000 грн',
      link: '/delivery',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Швидка доставка',
      description: 'Доставка протягом 1-3 днів',
      link: '/delivery',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <section className="py-16 bg-muted/30">
      <div className="container-custom">
        <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
          Спеціальні пропозиції
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promos.map((promo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={promo.link}>
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${promo.gradient} p-6 text-white transition-transform hover:scale-105`}>
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                  <div className="relative">
                    <div className="mb-4">{promo.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                    <p className="text-sm text-white/90">{promo.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
