import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import HeroSection from '@/components/home/HeroSection'
import Categories from '@/components/home/Categories'
import { Category } from '@/types'

// Below-fold sections: lazy-loaded after the critical path renders
const PromoSection = dynamic(() => import('@/components/home/PromoSection'))
const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'))
const RecentlyViewed = dynamic(() => import('@/components/home/RecentlyViewed'))
const NewsletterBanner = dynamic(() => import('@/components/home/NewsletterBanner'))

export const metadata: Metadata = {
  title: 'TechStore — Інтернет-магазин електроніки | Смартфони, Ноутбуки, Планшети',
  description:
    'TechStore — інтернет-магазин електроніки №1 в Україні. Купуйте смартфони, ноутбуки, планшети, навушники та аксесуари з офіційною гарантією та безкоштовною доставкою.',
  alternates: { canonical: '/' },
}

async function getCategories(): Promise<Category[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const res = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.categories) ? data.categories.slice(0, 6) : []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const categories = await getCategories()

  return (
    <>
      <HeroSection />
      <Categories initialCategories={categories} />
      <PromoSection />
      <FeaturedProducts />
      <RecentlyViewed />
      <NewsletterBanner />
    </>
  )
}
