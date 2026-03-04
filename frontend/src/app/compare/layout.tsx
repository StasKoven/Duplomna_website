import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Порівняння товарів',
  description:
    'Порівняйте характеристики та ціни електроніки в TechStore. Зручний інструмент для вибору найкращого товару.',
  alternates: { canonical: '/compare' },
  openGraph: {
    title: 'Порівняння товарів — TechStore',
    description: 'Порівнюйте електроніку за характеристиками та ціною.',
    type: 'website',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
