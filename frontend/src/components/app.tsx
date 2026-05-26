'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { Toaster } from 'sonner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import s from './app.module.css'

// Defer non-critical UI until after the first paint
const BottomNav = dynamic(() => import('@/components/layout/BottomNav'), { ssr: false })
const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false })

interface AppProps {
  children: ReactNode
}

export default function App({ children }: AppProps) {
  return (
    <>
      <div className={s.wrapper}>
        <Header />
        <main className={s.main}>{children}</main>
        <Footer />
      </div>
      <BottomNav />
      <ChatWidget />
      <Toaster position="top-right" richColors />
    </>
  )
}
