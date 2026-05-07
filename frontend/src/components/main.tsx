'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

interface MainProps {
  children: ReactNode
}

// Initializes the app (auth restore + cart hydration) without blocking the
// first paint. Runs once even under React.StrictMode's double-mount.
export default function Main({ children }: MainProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) return

      // Read fresh state via getState() rather than closing over the hook
      // values. This keeps the effect's dep list empty without lying to the
      // exhaustive-deps lint rule.
      const { fetchProfile } = useAuthStore.getState()
      const { setAuthenticated, fetchCart } = useCartStore.getState()

      if (useAuthStore.getState().isAuthenticated) return

      try {
        await fetchProfile()
        await fetchCart()
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setAuthenticated(false)
      }
    }

    initAuth()
  }, [])

  return <>{children}</>
}
