'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Percent, Package, Clock } from 'lucide-react'
import s from './PromoSection.module.css'

export default function PromoSection() {
  // Дані промо-акцій
  const promos = [
    {
      icon: <Percent className={s.icon} />,
      title: 'Знижки до 50%',
      description: 'На обрані моделі смартфонів',
      link: '/products?onSale=true',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Package className={s.icon} />,
      title: 'Безкоштовна доставка',
      description: 'При замовленні від 1000 грн',
      link: '/delivery',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Clock className={s.icon} />,
      title: 'Швидка доставка',
      description: 'Доставка протягом 1-3 днів',
      link: '/delivery',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    // Секція промо-пропозицій
    <section className={s.section}>
      <div className="container-custom">
        <h2 className={s.title}>
          Спеціальні пропозиції
        </h2>

        {/* Сітка карток */}
        <div className={s.gridLayout}>
          {promos.map((promo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={promo.link}>
                {/* Картка з динамічним градієнтом */}
                <div className={`${s.card} ${promo.gradient}`}>
                  <div className={s.circle} />
                  <div className={s.content}>
                    <div className={s.iconWrap}>{promo.icon}</div>
                    <h3 className={s.cardTitle}>{promo.title}</h3>
                    <p className={s.cardDescription}>{promo.description}</p>
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
