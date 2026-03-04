import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Часті запитання (FAQ)',
  description:
    'Відповіді на найпопулярніші запитання щодо замовлень, доставки, оплати, гарантії та повернення в інтернет-магазині TechStore.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — TechStore',
    description:
      'Відповіді на часті запитання: замовлення, доставка, оплата, гарантія.',
    type: 'website',
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
