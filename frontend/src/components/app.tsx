'use client'

import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import ChatWidget from '@/components/chat/ChatWidget'
import s from './app.module.css'

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
