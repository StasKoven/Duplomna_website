import type { Metadata } from 'next'
import s from './page.module.css'

export const metadata: Metadata = {
  title: 'Гарантія та повернення',
  description:
    'Гарантійні умови та правила повернення товарів у TechStore. Офіційна гарантія від виробника, повернення протягом 14 днів, простий процес обміну.',
  alternates: { canonical: '/warranty' },
  openGraph: {
    title: 'Гарантія та повернення — TechStore',
    description:
      'Офіційна гарантія на всю техніку, повернення протягом 14 днів, швидкий обмін товарів.',
    type: 'website',
  },
}

export default function WarrantyPage() {
  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.wrapper}>
        <h1 className={s.title}>Гарантія та повернення</h1>

        <div className={s.sections}>
          <section>
            <h2 className={s.sectionTitle}>Гарантійні умови</h2>
            <div className={s.content}>
              <p>
                На всі товари нашого магазину поширюється офіційна гарантія виробника.
                Термін гарантії залежить від категорії товару:
              </p>
              <ul className={s.guaranteeList}>
                <li>• Смартфони та планшети - 12 місяців</li>
                <li>• Ноутбуки та комп'ютери - 24 місяці</li>
                <li>• Аксесуари - 6 місяців</li>
                <li>• Телевізори - 12 місяців</li>
                <li>• Фото та відео техніка - 12 місяців</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={s.sectionTitle}>Умови обміну та повернення</h2>
            
            <div className={s.cardList}>
              <div className={s.card}>
                <h3 className={s.cardTitle}>14 днів на повернення</h3>
                <p className={s.cardText}>
                  Ви маєте право повернути товар належної якості протягом 14 днів з моменту покупки.
                </p>
                <p className={s.cardSubtext}>
                  Умови повернення:
                </p>
                <ul className={s.conditionList}>
                  <li>✓ Товар не використовувався</li>
                  <li>✓ Збережена оригінальна упаковка</li>
                  <li>✓ Наявні всі комплектуючі та документи</li>
                  <li>✓ Товарний вигляд не порушений</li>
                </ul>
              </div>

              <div className={s.card}>
                <h3 className={s.cardTitle}>Обмін товару</h3>
                <p className={s.exchangeText}>
                  Можливість обміну на аналогічний товар іншого кольору, розміру або комплектації 
                  протягом 14 днів з моменту покупки при дотриманні умов повернення.
                </p>
              </div>

              <div className={s.card}>
                <h3 className={s.cardTitle}>Гарантійний ремонт</h3>
                <p className={s.exchangeText}>
                  У разі виявлення заводського браку протягом гарантійного терміну, товар 
                  підлягає безкоштовному ремонту або заміні.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={s.sectionTitle}>Як оформити повернення?</h2>
            <div className={s.stepList}>
              <div className={s.step}>
                <div className={s.stepNumber}>
                  1
                </div>
                <div>
                  <p className={s.stepTitle}>Зв'яжіться з нами</p>
                  <p className={s.stepDesc}>
                    Напишіть на support@electronics.com або зателефонуйте за номером +380 XX XXX XX XX
                  </p>
                </div>
              </div>

              <div className={s.step}>
                <div className={s.stepNumber}>
                  2
                </div>
                <div>
                  <p className={s.stepTitle}>Отримайте підтвердження</p>
                  <p className={s.stepDesc}>
                    Ми розглянемо вашу заявку та надамо інструкції для повернення
                  </p>
                </div>
              </div>

              <div className={s.step}>
                <div className={s.stepNumber}>
                  3
                </div>
                <div>
                  <p className={s.stepTitle}>Відправте товар</p>
                  <p className={s.stepDesc}>
                    Надішліть товар разом з копією чеку на вказану адресу
                  </p>
                </div>
              </div>

              <div className={s.step}>
                <div className={s.stepNumber}>
                  4
                </div>
                <div>
                  <p className={s.stepTitle}>Отримайте кошти</p>
                  <p className={s.stepDesc}>
                    Після перевірки товару кошти будуть повернені протягом 5-7 робочих днів
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className={s.infoBox}>
            <h3 className={s.infoTitle}>Важливо знати</h3>
            <ul className={s.infoList}>
              <li>⚠ Товари не підлягають поверненню, якщо мали сліди використання</li>
              <li>⚠ Вартість доставки при поверненні оплачує покупець</li>
              <li>⚠ Повернення коштів здійснюється тим же способом, яким була проведена оплата</li>
              <li>⚠ При гарантійному ремонті термін гарантії продовжується на час ремонту</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
