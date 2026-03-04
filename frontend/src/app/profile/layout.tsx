import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Мій профіль',
  description: 'Налаштування профілю та особисті дані в TechStore.',
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
