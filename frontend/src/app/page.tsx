import type { Metadata } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import HeroSection from '@/components/home/HeroSection'
import Categories from '@/components/home/Categories'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import { Category, Product } from '@/types'

// Below-fold sections: client-only to avoid hydration suspension blocking LCP
const PromoSection = dynamic(() => import('@/components/home/PromoSection'), { ssr: false })
const RecentlyViewed = dynamic(() => import('@/components/home/RecentlyViewed'), { ssr: false })
const NewsletterBanner = dynamic(() => import('@/components/home/NewsletterBanner'), { ssr: false })

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

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const res = await fetch(`${apiUrl}/products/featured?limit=8`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.products) ? data.products : []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ])

  return (
    <>
      <HeroSection />
      <Suspense fallback={null}>
        <Categories initialCategories={categories} />
      </Suspense>
      <PromoSection />
      <Suspense fallback={null}>
        <FeaturedProducts initialProducts={featuredProducts} />
      </Suspense>
      <RecentlyViewed />
      <NewsletterBanner />
    </>
  )
}
