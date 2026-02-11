'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Часті питання</h1>
          <p className="text-muted-foreground">
            Знайдіть відповіді на найпопулярніші питання
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, faqIndex) => {
                  const itemId = `${catIndex}-${faqIndex}`
                  const isOpen = openItems.includes(itemId)

                  return (
                    <div
                      key={itemId}
                      className="bg-card border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition"
                      >
                        <span className="font-semibold pr-4">{faq.q}</span>
                        <ChevronDown
                          className={`h-5 w-5 flex-shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 text-muted-foreground">
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

        <div className="mt-12 p-6 bg-muted rounded-lg text-center">
          <h3 className="font-semibold text-lg mb-2">Не знайшли відповідь?</h3>
          <p className="text-muted-foreground mb-4">
            Зв'яжіться з нашою службою підтримки, і ми з радістю допоможемо
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition"
          >
            Зв'язатися з нами
          </a>
        </div>
      </div>
    </div>
  )
}
