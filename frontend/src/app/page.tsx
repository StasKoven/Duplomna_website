import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import Categories from '@/components/home/Categories'
import PromoSection from '@/components/home/PromoSection'

export const metadata: Metadata = {
  title: 'TechStore — Інтернет-магазин електроніки | Смартфони, Ноутбуки, Планшети',
  description:
    'TechStore — інтернет-магазин електроніки №1 в Україні. Купуйте смартфони, ноутбуки, планшети, навушники та аксесуари з офіційною гарантією та безкоштовною доставкою.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Categories />
      <FeaturedProducts />
      <PromoSection />
    </>
  )
}
