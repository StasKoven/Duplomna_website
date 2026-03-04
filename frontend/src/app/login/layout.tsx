import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Вхід в акаунт',
  description: 'Увійдіть у свій акаунт TechStore для перегляду замовлень та особистих даних.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
