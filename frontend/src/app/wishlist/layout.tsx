import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Список бажань',
  description: 'Збережені товари у вашому списку бажань TechStore.',
  robots: { index: false, follow: false },
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
