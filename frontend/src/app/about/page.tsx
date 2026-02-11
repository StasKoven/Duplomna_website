export default function AboutPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Про нас</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Ласкаво просимо до нашого інтернет-магазину електроніки!
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Наша місія</h2>
            <p className="text-muted-foreground">
              Ми прагнемо забезпечити наших клієнтів найновішими та найякіснішими 
              електронними пристроями за найкращими цінами. Наша мета - зробити 
              технології доступними для кожного.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Чому обирають нас?</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Офіційна гарантія на всі товари</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Швидка доставка по всій Україні</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Професійна консультація</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Конкурентні ціни</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Можливість обміну та повернення</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Наші переваги</h2>
            <p className="text-muted-foreground mb-4">
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
