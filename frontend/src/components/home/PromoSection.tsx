'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BadgePercent, Truck, ShieldCheck } from 'lucide-react'
import s from './PromoSection.module.css'

export default function PromoSection() {
  // Дані промо-акцій
  const promos = [
    {
      icon: <BadgePercent className={s.icon} />,
      title: 'Акції тижня',
      description: 'Знижки до 50% на обрані моделі',
      link: '/products?onSale=true',
      variant: 'blue'
    },
    {
      icon: <Truck className={s.icon} />,
      title: 'Безкоштовна доставка',
      description: 'Новою поштою від 1000 грн',
      link: '/delivery',
      variant: 'green'
    },
    {
      icon: <ShieldCheck className={s.icon} />,
      title: 'Гарантія до 2 років',
      description: 'Офіційний сервіс по всій Україні',
      link: '/warranty',
      variant: 'amber'
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
                <div className={`${s.card} ${s[promo.variant]}`}>
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
