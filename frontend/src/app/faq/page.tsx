'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import s from './page.module.css'

const faqs = [
  {
    category: 'Замовлення',
    questions: [
      {
        q: 'Як оформити замовлення?',
        a: 'Додайте товари до кошика, перейдіть до оформлення замовлення, заповніть необхідні дані та оберіть спосіб доставки та оплати.',
      },
      {
        q: 'Чи можу я змінити або скасувати замовлення?',
        a: 'Так, ви можете змінити або скасувати замовлення до моменту його відправки. Зв\'яжіться з нашою службою підтримки якнайшвидше.',
      },
      {
        q: 'Скільки часу обробляється замовлення?',
        a: 'Зазвичай замовлення обробляється протягом 1-2 робочих днів. Після відправки ви отримаєте трек-номер для відстеження.',
      },
    ],
  },
  {
    category: 'Оплата',
    questions: [
      {
        q: 'Які способи оплати ви приймаєте?',
        a: 'Ми приймаємо оплату карткою онлайн, готівкою при отриманні, та безготівковий розрахунок для юридичних осіб.',
      },
      {
        q: 'Чи безпечно платити онлайн?',
        a: 'Так, всі платежі проходять через захищений платіжний шлюз. Ми не зберігаємо дані вашої карти.',
      },
      {
        q: 'Чи можна оплатити частинами?',
        a: 'Так, для деяких товарів доступна оплата частинами через наших партнерів. Деталі уточнюйте при оформленні.',
      },
    ],
  },
  {
    category: 'Доставка',
    questions: [
      {
        q: 'Скільки коштує доставка?',
        a: 'Вартість доставки Новою Поштою від 50 грн. При замовленні від 1000 грн - доставка безкоштовна.',
      },
      {
        q: 'Скільки часу займає доставка?',
        a: 'Доставка по Україні займає 1-3 робочих дні після відправки. В великі міста може бути швидше.',
      },
      {
        q: 'Чи є доставка за кордон?',
        a: 'Наразі ми здійснюємо доставку тільки по території України.',
      },
    ],
  },
  {
    category: 'Гарантія та повернення',
    questions: [
      {
        q: 'Який термін гарантії?',
        a: 'Термін гарантії залежить від товару: смартфони - 12 місяців, ноутбуки - 24 місяці, аксесуари - 6 місяців.',
      },
      {
        q: 'Чи можу я повернути товар?',
        a: 'Так, протягом 14 днів ви можете повернути товар належної якості за умови збереження товарного вигляду та упаковки.',
      },
      {
        q: 'Що робити, якщо товар виявився несправним?',
        a: 'Зв\'яжіться з нами якомога швидше. Ми організуємо повернення, обмін або гарантійний ремонт.',
      },
    ],
  },
  {
    category: 'Технічні питання',
    questions: [
      {
        q: 'Всі товари оригінальні?',
        a: 'Так, ми працюємо лише з офіційними постачальниками та гарантуємо автентичність всіх товарів.',
      },
      {
        q: 'Чи є у вас фізичний магазин?',
        a: 'Так, ви можете відвідати наш шоу-рум за адресою: м. Київ, вул. Хрещатик, 1. Працюємо Пн-Пт: 9:00-18:00.',
      },
      {
        q: 'Як дізнатися про наявність товару?',
        a: 'Наявність вказана на сторінці кожного товару. Також ви можете зателефонувати або написати нам.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.wrapper}>
        <div className={s.header}>
          <h1 className={s.title}>Часті питання</h1>
          <p className={s.subtitle}>
            Знайдіть відповіді на найпопулярніші питання
          </p>
        </div>

        <div className={s.sections}>
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className={s.categoryTitle}>{category.category}</h2>
              <div className={s.questionList}>
                {category.questions.map((faq, faqIndex) => {
                  const itemId = `${catIndex}-${faqIndex}`
                  const isOpen = openItems.includes(itemId)

                  return (
                    <div
                      key={itemId}
                      className={s.questionCard}
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className={s.questionBtn}
                      >
                        <span className={s.questionText}>{faq.q}</span>
                        <ChevronDown
                          className={`${s.chevron} ${isOpen ? s.chevronOpen : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className={s.animWrapper}
                          >
                            <div className={s.answer}>
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={s.ctaBox}>
          <h3 className={s.ctaTitle}>Не знайшли відповідь?</h3>
          <p className={s.ctaText}>
            Зв'яжіться з нашою службою підтримки, і ми з радістю допоможемо
          </p>
          <a
            href="/contact"
            className={s.ctaLink}
          >
            Зв'язатися з нами
          </a>
        </div>
      </div>
    </div>
  )
}
