import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { User, AuthResponse } from '@/types'
import { toast } from 'sonner'
import { logError, logInfo } from '@/lib/errorLogger'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useComparisonStore } from '@/store/comparisonStore'

// Helper function to set auth cookie for middleware
const setAuthCookie = (token: string) => {
  if (typeof document !== 'undefined') {
    // Set cookie that expires in 7 days (same as refresh token)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `auth-token=${token}; path=/; expires=${expires}; SameSite=Lax${secure}`
  }
}

const removeAuthCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  googleLogin: () => Promise<void>
  logout: () => Promise<void>
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
          setAuthCookie(accessToken)

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
          setAuthCookie(accessToken)

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

          // Lazy-load Firebase — only needed when user actually clicks "Login with Google"
          const [{ signInWithPopup }, { auth, googleProvider }] = await Promise.all([
            import('firebase/auth'),
            import('@/lib/firebase'),
          ])

          // Sign in with Google via Firebase
          const result = await signInWithPopup(auth, googleProvider)
          const idToken = await result.user.getIdToken()

          // Send Firebase token to our backend
          const response = await api.post<AuthResponse>('/auth/google', { idToken })
          const { user, accessToken, refreshToken } = response.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          setAuthCookie(accessToken)

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

      logout: async () => {
        // Revoke refresh token on the server (best-effort, don't block UI)
        const refreshToken = get().refreshToken
        if (refreshToken) {
          api.post('/auth/logout', { refreshToken }).catch(() => {})
        }

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        removeAuthCookie()

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })

        // Очищуємо кошик, список бажань та порівняння при виході (серверні дані)
        if (typeof window !== 'undefined') {
          useCartStore.setState({ items: [], isAuthenticated: false })
          useWishlistStore.setState({ items: [] })
          useComparisonStore.setState({ comparisons: [], isAuthenticated: false })
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
            // Clear localStorage tokens and cookie
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              removeAuthCookie()
            }
          }
          // Don't throw - just log the error
          // throw error
        }
      },

      syncStores: async () => {
        // Sync cart, wishlist & comparisons after login
        if (typeof window !== 'undefined') {
          // Встановлюємо статус авторизації - це синхронізує локальний кошик з сервером
          useCartStore.getState().setAuthenticated(true)
          await useWishlistStore.getState().fetchWishlist()
          // Синхронізуємо порівняння з сервером
          useComparisonStore.getState().setAuthenticated(true)
          await useComparisonStore.getState().fetchComparisons()
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
