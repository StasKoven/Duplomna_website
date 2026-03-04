import type { Metadata } from 'next'
import s from './page.module.css'

export const metadata: Metadata = {
  title: 'Про нас — TechStore інтернет-магазин електроніки',
  description:
    'Дізнайтеся більше про інтернет-магазин TechStore: наша місія, переваги, офіційна гарантія, професійна консультація та швидка доставка по всій Україні.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Про нас — TechStore',
    description:
      'TechStore — надійний інтернет-магазин електроніки з офіційною гарантією та доставкою по Україні.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.wrapper}>
        <h1 className={s.title}>Про нас</h1>
        
        <div className={s.content}>
          <p className={s.intro}>
            Ласкаво просимо до нашого інтернет-магазину електроніки!
          </p>

          <section className={s.section}>
            <h2 className={s.sectionTitle}>Наша місія</h2>
            <p className={s.sectionText}>
              Ми прагнемо забезпечити наших клієнтів найновішими та найякіснішими 
              електронними пристроями за найкращими цінами. Наша мета - зробити 
              технології доступними для кожного.
            </p>
          </section>

          <section className={s.section}>
            <h2 className={s.sectionTitle}>Чому обирають нас?</h2>
            <ul className={s.list}>
              <li className={s.listItem}>
                <span className={s.checkmark}>✓</span>
                <span>Офіційна гарантія на всі товари</span>
              </li>
              <li className={s.listItem}>
                <span className={s.checkmark}>✓</span>
                <span>Швидка доставка по всій Україні</span>
              </li>
              <li className={s.listItem}>
                <span className={s.checkmark}>✓</span>
                <span>Професійна консультація</span>
              </li>
              <li className={s.listItem}>
                <span className={s.checkmark}>✓</span>
                <span>Конкурентні ціни</span>
              </li>
              <li className={s.listItem}>
                <span className={s.checkmark}>✓</span>
                <span>Можливість обміну та повернення</span>
              </li>
            </ul>
          </section>

          <section className={s.section}>
            <h2 className={s.sectionTitle}>Наші переваги</h2>
            <p className={s.advantagesText}>
              Ми працюємо лише з офіційними постачальниками та гарантуємо 
              автентичність всіх товарів. Кожен продукт проходить ретельну 
              перевірку перед відправкою.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
