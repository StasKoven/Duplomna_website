'use client'

import Link from 'next/link'
import { BadgePercent, Truck, ShieldCheck, ArrowRight } from 'lucide-react'
import s from './PromoSection.module.css'

export default function PromoSection() {
  const promos = [
    {
      icon: <BadgePercent className={s.icon} />,
      title: 'Акції тижня',
      description: 'Знижки до 50% на обрані моделі смартфонів, ноутбуків та аксесуарів',
      cta: 'Дивитися акції',
      link: '/products?onSale=true',
      variant: 'blue'
    },
    {
      icon: <Truck className={s.icon} />,
      title: 'Безкоштовна доставка',
      description: 'Доставляємо Новою Поштою по всій Україні від 1000 грн',
      cta: 'Деталі доставки',
      link: '/delivery',
      variant: 'green'
    },
    {
      icon: <ShieldCheck className={s.icon} />,
      title: 'Гарантія до 2 років',
      description: 'Офіційний сервіс і повернення коштів протягом 14 днів',
      cta: 'Про гарантію',
      link: '/warranty',
      variant: 'amber'
    }
  ]

  return (
    <section className={s.section}>
      <div className="container-custom">
        <div className={s.header}>
          <h2 className={s.title}>Чому обирають TechStore</h2>
          <p className={s.subtitle}>
            Працюємо для того, щоб купувати техніку було легко, швидко і вигідно
          </p>
        </div>

        <div className={s.gridLayout}>
          {promos.map((promo, index) => (
            <div
              key={index}
              className={s.promoItem}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={promo.link}>
                <div className={`${s.card} ${s[promo.variant]}`}>
                  <span className={s.circle} aria-hidden />
                  <span className={s.circleSm} aria-hidden />
                  <div className={s.content}>
                    <div className={s.iconWrap}>{promo.icon}</div>
                    <h3 className={s.cardTitle}>{promo.title}</h3>
                    <p className={s.cardDescription}>{promo.description}</p>
                    <span className={s.cta}>
                      {promo.cta}
                      <ArrowRight className={s.ctaIcon} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
