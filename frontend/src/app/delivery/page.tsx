export default function DeliveryPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Доставка та оплата</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Способи доставки</h2>
            
            <div className="space-y-4">
              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Нова Пошта</h3>
                <p className="text-muted-foreground mb-2">
                  Доставка у відділення або поштомат
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Термін доставки: 1-3 робочих дні</li>
                  <li>• Вартість: від 50 грн (безкоштовно при замовленні від 1000 грн)</li>
                </ul>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Кур'єрська доставка</h3>
                <p className="text-muted-foreground mb-2">
                  Доставка за вказаною адресою
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Термін доставки: 1-2 робочих дні</li>
                  <li>• Вартість: від 80 грн (доступно для великих міст)</li>
                </ul>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Самовивіз</h3>
                <p className="text-muted-foreground mb-2">
                  Забрати товар з нашого офісу
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Безкоштовно</li>
                  <li>• м. Київ, вул. Хрещатик, 1</li>
                  <li>• Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Способи оплати</h2>
            
            <div className="space-y-4">
              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Оплата при отриманні</h3>
                <p className="text-muted-foreground">
                  Оплата готівкою або карткою при отриманні товару
                </p>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Онлайн оплата</h3>
                <p className="text-muted-foreground">
                  Оплата банківською карткою через безпечний платіжний шлюз
                </p>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Безготівковий розрахунок</h3>
                <p className="text-muted-foreground">
                  Для юридичних осіб (з ПДВ та без ПДВ)
                </p>
              </div>
            </div>
          </section>

          <section className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Важлива інформація</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
