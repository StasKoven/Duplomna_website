'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

interface MainProps {
  children: ReactNode
}

// This component initializes the app without blocking rendering
export default function Main({ children }: MainProps) {
  const { fetchProfile, isAuthenticated } = useAuthStore()
  const { setAuthenticated, fetchCart } = useCartStore()
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initialized.current) return
    initialized.current = true

    // Initialize auth in background - doesn't block rendering
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      
      if (accessToken && !isAuthenticated) {
        try {
          await fetchProfile()
          // Синхронізуємо стан авторизації з кошиком
          setAuthenticated(true)
          // Завантажуємо кошик з сервера
          await fetchCart()
        } catch (error) {
          console.error('Failed to restore session:', error)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setAuthenticated(false)
        }
      }
    }

    initAuth()
  }, [])

  // Always render children immediately
  return <>{children}</>
}
