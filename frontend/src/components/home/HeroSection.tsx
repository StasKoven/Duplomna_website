import Link from 'next/link'
import { ArrowRight, ShieldCheck, Truck, Headphones, Sparkles } from 'lucide-react'
import s from './HeroSection.module.css'

// Server component — no JS shipped for this section.
// Animations are pure CSS (identical visuals to the previous framer-motion version).
export default function HeroSection() {
  return (
    <section className={s.section}>
      <div className={s.bgGrid} aria-hidden />
      <div className={s.glowBlue} aria-hidden />
      <div className={s.glowPurple} aria-hidden />

      <div className={`container-custom ${s.wrapper}`}>
        <div className={s.layout}>
          <div className={s.content}>
            <div className={s.badge}>
              <Sparkles className={s.badgeIcon} />
              <span>Нові надходження вже у каталозі</span>
            </div>

            <h1 className={s.title}>
              Техніка, яка працює
              <span className={s.titleAccent}>на вас</span>
            </h1>

            <p className={s.description}>
              Смартфони, ноутбуки, планшети та аксесуари від перевірених брендів.
              Офіційна гарантія, професійна консультація та швидка доставка по Україні.
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

            <div className={s.stats}>
              <div className={s.statItem}>
                <span className={s.statValue}>15K+</span>
                <span className={s.statLabel}>Товарів у наявності</span>
              </div>
              <div className={s.statDivider} aria-hidden />
              <div className={s.statItem}>
                <span className={s.statValue}>50K+</span>
                <span className={s.statLabel}>Задоволених клієнтів</span>
              </div>
              <div className={s.statDivider} aria-hidden />
              <div className={s.statItem}>
                <span className={s.statValue}>4.9★</span>
                <span className={s.statLabel}>Середній рейтинг</span>
              </div>
            </div>
          </div>

          <div className={s.visual}>
            <div className={s.deviceCard}>
              <div className={s.deviceGlow} aria-hidden />
              <div className={s.deviceInner}>
                <div className={s.deviceTop}>
                  <span className={s.dot} />
                  <span className={s.dot} />
                  <span className={s.dot} />
                </div>
                <div className={s.deviceScreen}>
                  <div className={s.screenRow}>
                    <div className={s.screenBlockLg} />
                    <div className={s.screenBlockSm} />
                  </div>
                  <div className={s.screenRow}>
                    <div className={s.screenBlockMd} />
                    <div className={s.screenBlockMd} />
                  </div>
                  <div className={s.screenBig} />
                </div>
              </div>

              <div className={`${s.floatCard} ${s.floatCardTop}`}>
                <ShieldCheck className={s.floatIcon} />
                <div>
                  <div className={s.floatTitle}>Гарантія</div>
                  <div className={s.floatDesc}>до 2 років</div>
                </div>
              </div>

              <div className={`${s.floatCard} ${s.floatCardBottom}`}>
                <Truck className={s.floatIcon} />
                <div>
                  <div className={s.floatTitle}>Доставка</div>
                  <div className={s.floatDesc}>1–3 дні</div>
                </div>
              </div>

              <div className={`${s.floatCard} ${s.floatCardSide}`}>
                <Headphones className={s.floatIcon} />
                <div>
                  <div className={s.floatTitle}>Підтримка</div>
                  <div className={s.floatDesc}>24/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
