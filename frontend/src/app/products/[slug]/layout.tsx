import type { Metadata, ResolvingMetadata } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techstore.ua'

interface ProductData {
  name: string
  description?: string
  price: number
  images?: string[]
  brand?: string
  category?: { name: string }
  slug: string
}

type Props = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.product || data || null
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: 'Товар не знайдено',
      description: 'Цей товар відсутній або був видалений.',
    }
  }

  const title = `${product.name} — купити в TechStore`
  const description = product.description
    ? product.description.slice(0, 160)
    : `Купити ${product.name} за ${product.price} грн в TechStore. Офіційна гарантія, швидка доставка по Україні.`

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/products/${slug}`,
      images: product.images?.length
        ? product.images.map((img) => ({
            url: img,
            width: 800,
            height: 600,
            alt: product.name,
          }))
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children
}
