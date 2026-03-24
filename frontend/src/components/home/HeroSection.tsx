'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Cpu, Headphones, Smartphone, Laptop, Watch, Wifi } from 'lucide-react'
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
        <div className={s.gridLayout}>
          {/* Ліва частина — текст і CTA кнопки */}
          <MotionWrapper
            {...(mounted && {
              initial: { opacity: 0, x: -50 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 0.5 }
            })}
            className={s.leftContent}
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

          {/* Права частина — ілюстрація */}
          <MotionWrapper
            {...(mounted && {
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.5, delay: 0.2 }
            })}
            className={s.rightContent}
          >
            <div className={s.illustrationCard}>
              <div className={s.gridOverlay} />
              <div className={s.illustrationInner}>
                <div className={s.floatingDevices}>
                  <div className={s.deviceCard + ' ' + s.deviceCard1}>
                    <Smartphone className={s.deviceIcon} />
                    <span className={s.deviceLabel}>Смартфони</span>
                  </div>
                  <div className={s.deviceCard + ' ' + s.deviceCard2}>
                    <Laptop className={s.deviceIcon} />
                    <span className={s.deviceLabel}>Ноутбуки</span>
                  </div>
                  <div className={s.deviceCard + ' ' + s.deviceCard3}>
                    <Headphones className={s.deviceIcon} />
                    <span className={s.deviceLabel}>Навушники</span>
                  </div>
                  <div className={s.deviceCard + ' ' + s.deviceCard4}>
                    <Watch className={s.deviceIcon} />
                    <span className={s.deviceLabel}>Годинники</span>
                  </div>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  )
}
