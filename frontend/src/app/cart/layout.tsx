import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Кошик',
  description: 'Ваш кошик покупок у TechStore. Перегляньте обрані товари та оформіть замовлення.',
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
