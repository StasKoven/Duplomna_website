import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import Main from '@/components/main'
import App from '@/components/app'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techstore.ua'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TechStore — Інтернет-магазин електроніки | Смартфони, Ноутбуки, Планшети',
    template: '%s | TechStore',
  },
  description:
    'TechStore — інтернет-магазин електроніки в Україні. Купуйте смартфони, ноутбуки, планшети, навушники та аксесуари за найкращими цінами з офіційною гарантією та швидкою доставкою по всій Україні.',
  keywords: [
    'інтернет-магазин', 'електроніка', 'купити смартфон', 'купити ноутбук',
    'планшети', 'навушники', 'техніка', 'гаджети', 'Україна',
    'смартфони ціна', 'ноутбуки ціна', 'доставка по Україні',
    'TechStore', 'офіційна гарантія', 'смарт-годинники',
  ],
  authors: [{ name: 'TechStore' }],
  creator: 'TechStore',
  publisher: 'TechStore',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'uk-UA': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: SITE_URL,
    siteName: 'TechStore',
    title: 'TechStore — Інтернет-магазин електроніки в Україні',
    description:
      'Смартфони, ноутбуки, планшети, навушники та аксесуари за найкращими цінами. Офіційна гарантія, швидка доставка по всій Україні.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'TechStore — Інтернет-магазин електроніки',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechStore — Інтернет-магазин електроніки',
    description:
      'Смартфони, ноутбуки, планшети та аксесуари. Офіційна гарантія, доставка по Україні.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: [
      'googlec02f0b95ebec5bf4',
      'oiDZXHlmyAMUHdPhSJkmp1-HsQtXbA_obKPQFITaHYY',
      'x-x4jnQzGr50KEfbgiXIUCREVkaUem90NPFiYeuGsYo',
    ],
  },
  category: 'ecommerce',
}

/* JSON-LD: Organization + WebSite + SearchAction */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'TechStore',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.png`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+380-XX-XXX-XXXX',
        contactType: 'customer service',
        areaServed: 'UA',
        availableLanguage: 'Ukrainian',
      },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'TechStore',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'uk-UA',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Main>
              <App>{children}</App>
            </Main>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
