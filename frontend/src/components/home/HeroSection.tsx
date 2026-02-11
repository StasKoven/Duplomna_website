'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react'

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render static version first, then animate
  const MotionWrapper = mounted ? motion.div : 'div'

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-10 sm:py-16 md:py-20">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* ==================== */}
          {/* Left Content Section */}
          {/* Ліва частина з текстом та CTA кнопками */}
          {/* Анімований вхід зліва */}
          {/* ==================== */}
          <MotionWrapper
            {...(mounted && {
              initial: { opacity: 0, x: -50 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 0.5 }
            })}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              Найкраща електроніка
              <span className="block text-primary mt-1 sm:mt-2">за доступними цінами</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              Смартфони, ноутбуки, планшети та аксесуари від провідних брендів.
              Офіційна гарантія та безкоштовна доставка.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 sm:px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 active:bg-primary/80"
              >
                Переглянути каталог
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 sm:px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
              >
                Дізнатись більше
              </Link>
            </div>

            {/* ==================== */}
            {/* Features Grid */}
            {/* Блок переваг: доставка, гарантія, безкоштовна доставка */}
            {/* ==================== */}
            <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex items-center sm:items-start space-x-3 bg-background/50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">Швидка доставка</h3>
                  <p className="text-xs text-muted-foreground">1-3 дні по Україні</p>
                </div>
              </div>
              <div className="flex items-center sm:items-start space-x-3 bg-background/50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">Гарантія якості</h3>
                  <p className="text-xs text-muted-foreground">Офіційна гарантія</p>
                </div>
              </div>
              <div className="flex items-center sm:items-start space-x-3 bg-background/50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">Безкоштовна доставка</h3>
                  <p className="text-xs text-muted-foreground">Від 1000 грн</p>
                </div>
              </div>
            </div>
          </MotionWrapper>

          {/* ==================== */}
          {/* Right Illustration Section */}
          {/* Права частина з ілюстрацією */}
          {/* Прихована на маленьких екранах */}
          {/* Анімований вхід з масштабуванням */}
          {/* ==================== */}
          <MotionWrapper
            {...(mounted && {
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.5, delay: 0.2 }
            })}
            className="relative hidden sm:block lg:ml-auto"
          >
            <div className="relative h-[280px] sm:h-[350px] lg:h-[400px] w-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 sm:p-8 overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 mb-3 sm:mb-4">
                    <span className="text-5xl sm:text-6xl">📱</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Новинки техніки</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Вже в наявності</p>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  )
}
