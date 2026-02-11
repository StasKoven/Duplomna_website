import HeroSection from '@/components/home/HeroSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import Categories from '@/components/home/Categories'
import PromoSection from '@/components/home/PromoSection'

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
