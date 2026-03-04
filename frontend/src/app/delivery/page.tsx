import type { Metadata } from 'next'
import s from './page.module.css'

export const metadata: Metadata = {
  title: 'Доставка та оплата',
  description:
    'Умови доставки та способи оплати в TechStore. Нова Пошта, кур\'єрська доставка, самовивіз. Оплата при отриманні, онлайн-оплата, безготівковий розрахунок.',
  alternates: { canonical: '/delivery' },
  openGraph: {
    title: 'Доставка та оплата — TechStore',
    description:
      'Швидка доставка по всій Україні: Нова Пошта, кур\'єр, самовивіз. Зручні способи оплати.',
    type: 'website',
  },
}

export default function DeliveryPage() {
  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.wrapper}>
        <h1 className={s.title}>Доставка та оплата</h1>

        <div className={s.sections}>
          <section>
            <h2 className={s.sectionTitle}>Способи доставки</h2>
            
            <div className={s.cardList}>
              <div className={s.card}>
                <h3 className={s.cardTitle}>Нова Пошта</h3>
                <p className={s.cardDesc}>
                  Доставка у відділення або поштомат
                </p>
                <ul className={s.cardDetails}>
                  <li>• Термін доставки: 1-3 робочих дні</li>
                  <li>• Вартість: від 50 грн (безкоштовно при замовленні від 1000 грн)</li>
                </ul>
              </div>

              <div className={s.card}>
                <h3 className={s.cardTitle}>Кур'єрська доставка</h3>
                <p className={s.cardDesc}>
                  Доставка за вказаною адресою
                </p>
                <ul className={s.cardDetails}>
                  <li>• Термін доставки: 1-2 робочих дні</li>
                  <li>• Вартість: від 80 грн (доступно для великих міст)</li>
                </ul>
              </div>

              <div className={s.card}>
                <h3 className={s.cardTitle}>Самовивіз</h3>
                <p className={s.cardDesc}>
                  Забрати товар з нашого офісу
                </p>
                <ul className={s.cardDetails}>
                  <li>• Безкоштовно</li>
                  <li>• м. Київ, вул. Хрещатик, 1</li>
                  <li>• Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className={s.sectionTitle}>Способи оплати</h2>
            
            <div className={s.cardList}>
              <div className={s.card}>
                <h3 className={s.cardTitle}>Оплата при отриманні</h3>
                <p className={s.cardText}>
                  Оплата готівкою або карткою при отриманні товару
                </p>
              </div>

              <div className={s.card}>
                <h3 className={s.cardTitle}>Онлайн оплата</h3>
                <p className={s.cardText}>
                  Оплата банківською карткою через безпечний платіжний шлюз
                </p>
              </div>

              <div className={s.card}>
                <h3 className={s.cardTitle}>Безготівковий розрахунок</h3>
                <p className={s.cardText}>
                  Для юридичних осіб (з ПДВ та без ПДВ)
                </p>
              </div>
            </div>
          </section>

          <section className={s.infoBox}>
            <h3 className={s.infoTitle}>Важлива інформація</h3>
            <ul className={s.infoList}>
              <li>✓ Відправка замовлень здійснюється щодня (окрім неділі)</li>
              <li>✓ При отриманні обов'язково перевіряйте комплектацію та стан товару</li>
              <li>✓ Зберігайте упаковку для можливості повернення/обміну</li>
              <li>✓ Термін зберігання посилки у відділенні Нової Пошти - 5 робочих днів</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
