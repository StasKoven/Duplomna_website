import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Каталог товарів — смартфони, ноутбуки, планшети',
  description:
    'Каталог електроніки TechStore. Великий вибір смартфонів, ноутбуків, планшетів, навушників та аксесуарів. Фільтрація за ціною, брендом та категорією.',
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Каталог товарів — TechStore',
    description:
      'Великий вибір електроніки: смартфони, ноутбуки, планшети, навушники та аксесуари за найкращими цінами.',
    type: 'website',
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
