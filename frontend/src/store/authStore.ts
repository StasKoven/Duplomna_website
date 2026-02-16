import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { User, AuthResponse } from '@/types'
import { toast } from 'sonner'
import { logError, logInfo } from '@/lib/errorLogger'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  googleLogin: () => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  fetchProfile: () => Promise<void>
  syncStores: () => Promise<void>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          logInfo('Auth Store', 'Login attempt', { email })
          set({ isLoading: true })
          const response = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
          })

          const { user, accessToken, refreshToken } = response.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          // Sync cart and wishlist
          await get().syncStores()

          logInfo('Auth Store', 'Login successful', { userId: user.id })
          toast.success('Вхід виконано успішно!')
        } catch (error: any) {
          logError('Auth Store - Login', error, { email })
          set({ isLoading: false })
          if (error?.response?.status === 401) {
            // Localized clear message for invalid credentials
            toast.error('Невірний email або пароль')
          } else {
            toast.error(error?.response?.data?.message || 'Помилка входу')
          }
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          logInfo('Auth Store', 'Register attempt', { email: data.email })
          set({ isLoading: true })
          const response = await api.post<AuthResponse>('/auth/register', data)

          const { user, accessToken, refreshToken } = response.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          // Sync cart and wishlist
          await get().syncStores()

          logInfo('Auth Store', 'Registration successful', { userId: user.id })
          toast.success('Реєстрація успішна!')
        } catch (error: any) {
          logError('Auth Store - Register', error, { email: data.email })
          set({ isLoading: false })
          toast.error(error.response?.data?.message || 'Помилка реєстрації')
          throw error
        }
      },

      googleLogin: async () => {
        try {
          logInfo('Auth Store', 'Google login attempt')
          set({ isLoading: true })

          // Sign in with Google via Firebase
          const result = await signInWithPopup(auth, googleProvider)
          const idToken = await result.user.getIdToken()

          // Send Firebase token to our backend
          const response = await api.post<AuthResponse>('/auth/google', { idToken })
          const { user, accessToken, refreshToken } = response.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          // Sync cart and wishlist
          await get().syncStores()

          logInfo('Auth Store', 'Google login successful', { userId: user.id })
          toast.success('Вхід через Google успішний!')
        } catch (error: any) {
          logError('Auth Store - Google Login', error)
          set({ isLoading: false })
          
          // Handle specific Firebase errors
          if (error?.code === 'auth/popup-closed-by-user') {
            // User closed the popup, no need to show error
            return
          }
          if (error?.code === 'auth/cancelled-popup-request') {
            return
          }
          
          toast.error(error?.response?.data?.message || 'Помилка входу через Google')
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })

        // Очищуємо кошик та список бажань при виході
        if (typeof window !== 'undefined') {
          const { useCartStore } = require('@/store/cartStore')
          const { useWishlistStore } = require('@/store/wishlistStore')
          // Очищуємо кошик повністю при виході з акаунта
          useCartStore.setState({ items: [], isAuthenticated: false })
          useWishlistStore.setState({ items: [] })
        }

        toast.success('Ви вийшли з системи')
      },

      setUser: (user: User) => {
        set({ user })
      },

      fetchProfile: async () => {
        try {
          logInfo('Auth Store', 'Fetching profile...')
          const response = await api.get('/auth/profile')
          set({ 
            user: response.data.user, 
            isAuthenticated: true 
          })
          logInfo('Auth Store', 'Profile fetched successfully')
          
          // Sync stores after successful profile fetch
          await get().syncStores()
        } catch (error: any) {
          logError('Auth Store - Fetch Profile', error)
          
          // Only clear auth state if it's an auth error (401/403), not network errors
          const status = error?.response?.status
          const isAuthError = status === 401 || status === 403
          const isNetworkError = error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED'
          
          if (isAuthError && !isNetworkError) {
            // Clear auth state only on auth errors
            set({ 
              user: null, 
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false 
            })
            // Clear localStorage tokens
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
            }
          }
          // Don't throw - just log the error
          // throw error
        }
      },

      syncStores: async () => {
        // Sync cart and wishlist after login
        if (typeof window !== 'undefined') {
          const { useCartStore } = require('@/store/cartStore')
          const { useWishlistStore } = require('@/store/wishlistStore')
          // Встановлюємо статус авторизації - це синхронізує локальний кошик з сервером
          useCartStore.getState().setAuthenticated(true)
          await useWishlistStore.getState().fetchWishlist()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
