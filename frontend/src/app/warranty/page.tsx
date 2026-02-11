export default function WarrantyPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Гарантія та повернення</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Гарантійні умови</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                На всі товари нашого магазину поширюється офіційна гарантія виробника.
                Термін гарантії залежить від категорії товару:
              </p>
              <ul className="space-y-2 my-4">
                <li>• Смартфони та планшети - 12 місяців</li>
                <li>• Ноутбуки та комп'ютери - 24 місяці</li>
                <li>• Аксесуари - 6 місяців</li>
                <li>• Телевізори - 12 місяців</li>
                <li>• Фото та відео техніка - 12 місяців</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Умови обміну та повернення</h2>
            
            <div className="space-y-4">
              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">14 днів на повернення</h3>
                <p className="text-muted-foreground mb-3">
                  Ви маєте право повернути товар належної якості протягом 14 днів з моменту покупки.
                </p>
                <p className="text-sm text-muted-foreground">
                  Умови повернення:
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground mt-2">
                  <li>✓ Товар не використовувався</li>
                  <li>✓ Збережена оригінальна упаковка</li>
                  <li>✓ Наявні всі комплектуючі та документи</li>
                  <li>✓ Товарний вигляд не порушений</li>
                </ul>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Обмін товару</h3>
                <p className="text-muted-foreground">
                  Можливість обміну на аналогічний товар іншого кольору, розміру або комплектації 
                  протягом 14 днів з моменту покупки при дотриманні умов повернення.
                </p>
              </div>

              <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Гарантійний ремонт</h3>
                <p className="text-muted-foreground">
                  У разі виявлення заводського браку протягом гарантійного терміну, товар 
                  підлягає безкоштовному ремонту або заміні.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Як оформити повернення?</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Зв'яжіться з нами</p>
                  <p className="text-sm">
                    Напишіть на support@electronics.com або зателефонуйте за номером +380 XX XXX XX XX
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Отримайте підтвердження</p>
                  <p className="text-sm">
                    Ми розглянемо вашу заявку та надамо інструкції для повернення
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Відправте товар</p>
                  <p className="text-sm">
                    Надішліть товар разом з копією чеку на вказану адресу
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <p className="font-medium text-foreground">Отримайте кошти</p>
                  <p className="text-sm">
                    Після перевірки товару кошти будуть повернені протягом 5-7 робочих днів
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Важливо знати</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
