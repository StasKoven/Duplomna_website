import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Оформлення замовлення',
  description: 'Оформлення замовлення в TechStore. Введіть дані доставки та оберіть спосіб оплати.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
