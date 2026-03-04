import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Реєстрація',
  description: 'Створіть акаунт у TechStore для швидкого оформлення замовлень та відстеження доставки.',
  robots: { index: false, follow: false },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
