import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/siteConfig'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/orders/',
          '/cart/',
          '/wishlist/',
          '/test-auth/',
          '/api/',
          '/forgot-password/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/profile/', '/orders/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
