import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакти',
  description:
    'Зв\'яжіться з TechStore: форма зворотного зв\'язку, електронна пошта, телефон. Ми завжди готові допомогти з вибором та замовленням електроніки.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Контакти — TechStore',
    description:
      'Зв\'яжіться з нами для консультації або питань щодо замовлення.',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
