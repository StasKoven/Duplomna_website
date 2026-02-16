'use client'

import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import ChatWidget from '@/components/chat/ChatWidget'

interface AppProps {
  children: ReactNode
}

export default function App({ children }: AppProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
      </div>
      <BottomNav />
      <ChatWidget />
      <Toaster position="top-right" richColors />
    </>
  )
}
