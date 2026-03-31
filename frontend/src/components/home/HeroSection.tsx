'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Cpu, Headphones, Wifi } from 'lucide-react'
import s from './HeroSection.module.css'

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Рендер статичної версії, потім анімація
  const MotionWrapper = mounted ? motion.div : 'div'

  return (
    <section className={s.section}>
      <div className="container-custom">
        {/* Центрований контент */}
        <MotionWrapper
          {...(mounted && {
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5 }
          })}
          className={s.content}
        >
          <h1 className={s.title}>
            Техніка, яка працює
            <span className={s.titleAccent}>на вас</span>
          </h1>
          <p className={s.description}>
            Смартфони, ноутбуки, планшети та аксесуари від перевірених брендів.
            Офіційна гарантія, професійна консультація та швидка доставка.
          </p>
          <div className={s.actions}>
            <Link href="/products" className={s.primaryBtn}>
              Перейти до каталогу
              <ArrowRight className={s.arrowIcon} />
            </Link>
            <Link href="/categories" className={s.secondaryBtn}>
              Категорії товарів
            </Link>
          </div>

          {/* Блок переваг */}
          <div className={s.featuresGrid}>
            <div className={s.featureCard}>
              <div className={s.featureIconWrap}>
                <Cpu className={s.featureIcon} />
              </div>
              <div className={s.featureText}>
                <h3 className={s.featureTitle}>Оригінальна техніка</h3>
                <p className={s.featureDesc}>Лише сертифіковані товари</p>
              </div>
            </div>
            <div className={s.featureCard}>
              <div className={s.featureIconWrap}>
                <Headphones className={s.featureIcon} />
              </div>
              <div className={s.featureText}>
                <h3 className={s.featureTitle}>Підтримка 24/7</h3>
                <p className={s.featureDesc}>Завжди на звʼязку</p>
              </div>
            </div>
            <div className={s.featureCard}>
              <div className={s.featureIconWrap}>
                <Wifi className={s.featureIcon} />
              </div>
              <div className={s.featureText}>
                <h3 className={s.featureTitle}>Доставка по Україні</h3>
                <p className={s.featureDesc}>Від 1 до 3 днів</p>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </section>
  )
}
