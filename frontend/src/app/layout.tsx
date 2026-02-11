import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import Main from '@/components/main'
import App from '@/components/app'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'TechStore - Інтернет-магазин електроніки',
  description: 'Найкращі ціни на смартфони, ноутбуки, планшети та іншу електроніку',
  keywords: 'електроніка, смартфони, ноутбуки, планшети, техніка',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
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
