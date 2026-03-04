import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Категорії товарів',
  description:
    'Перегляньте всі категорії електроніки в TechStore: смартфони, ноутбуки, планшети, смарт-годинники, навушники, камери, телевізори та ігрові пристрої.',
  alternates: { canonical: '/categories' },
  openGraph: {
    title: 'Категорії товарів — TechStore',
    description:
      'Всі категорії електроніки: смартфони, ноутбуки, планшети, навушники та багато іншого.',
    type: 'website',
  },
}

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
