'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react'
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
              Найкраща електроніка
              <span className={s.titleAccent}>за доступними цінами</span>
            </h1>
            <p className={s.description}>
              Смартфони, ноутбуки, планшети та аксесуари від провідних брендів.
              Офіційна гарантія та безкоштовна доставка.
            </p>
            <div className={s.actions}>
              <Link href="/products" className={s.primaryBtn}>
                Переглянути каталог
                <ArrowRight className={s.arrowIcon} />
              </Link>
              <Link href="/about" className={s.secondaryBtn}>
                Дізнатись більше
              </Link>
            </div>

            {/* Блок переваг */}
            <div className={s.featuresGrid}>
              <div className={s.featureCard}>
                <div className={s.featureIconWrap}>
                  <Zap className={s.featureIcon} />
                </div>
                <div className={s.featureText}>
                  <h3 className={s.featureTitle}>Швидка доставка</h3>
                  <p className={s.featureDesc}>1-3 дні по Україні</p>
                </div>
              </div>
              <div className={s.featureCard}>
                <div className={s.featureIconWrap}>
                  <Shield className={s.featureIcon} />
                </div>
                <div className={s.featureText}>
                  <h3 className={s.featureTitle}>Гарантія якості</h3>
                  <p className={s.featureDesc}>Офіційна гарантія</p>
                </div>
              </div>
              <div className={s.featureCard}>
                <div className={s.featureIconWrap}>
                  <Truck className={s.featureIcon} />
                </div>
                <div className={s.featureText}>
                  <h3 className={s.featureTitle}>Безкоштовна доставка</h3>
                  <p className={s.featureDesc}>Від 1000 грн</p>
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
                <div className={s.illustrationCenter}>
                  <div className={s.illustrationCircle}>
                    <span className={s.illustrationEmoji}>📱</span>
                  </div>
                  <h3 className={s.illustrationTitle}>Новинки техніки</h3>
                  <p className={s.illustrationDesc}>Вже в наявності</p>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  )
}
