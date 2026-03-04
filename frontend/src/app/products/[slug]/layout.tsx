import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Товар — TechStore',
  description:
    'Купуйте електроніку в TechStore за найкращими цінами. Офіційна гарантія, швидка доставка по всій Україні.',
  openGraph: {
    title: 'Товар — TechStore',
    description:
      'Інтернет-магазин електроніки TechStore. Смартфони, ноутбуки, планшети та аксесуари.',
    type: 'website',
  },
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children
}
