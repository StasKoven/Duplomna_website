import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const isProduction = process.env.NODE_ENV === 'production'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: isProduction ? 30000 : 15000,
})

// Retry helper for GET requests that fail due to network/server startup issues
const MAX_RETRIES = 2
const RETRY_DELAY = 500 // ms

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const isRetryableError = (error: AxiosError) => {
  // Retry on network errors (backend not started yet) or 5xx server errors
  if (!error.response) return true // Network error / ECONNREFUSED
  const status = error.response.status
  return status >= 500 || status === 0
}

// Override the default get method to add retry logic for resilience
const originalGet = api.get.bind(api)
api.get = async function retryGet(...args: Parameters<typeof originalGet>) {
  let lastError: any
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await originalGet(...args)
    } catch (error: any) {
      lastError = error
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        await sleep(RETRY_DELAY * (attempt + 1))
      } else {
        throw error
      }
    }
  }
  throw lastError
} as typeof originalGet

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Shared refresh promise to prevent concurrent refresh attempts
let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                           originalRequest?.url?.includes('/auth/register') ||
                           originalRequest?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
        
        if (!refreshToken) {
          return Promise.reject(error)
        }

        // Share a single refresh call across all concurrent 401 responses
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
            const { accessToken, refreshToken: newRefreshToken } = response.data

            if (typeof window !== 'undefined') {
              localStorage.setItem('accessToken', accessToken)
              localStorage.setItem('refreshToken', newRefreshToken)

              // Update auth cookie so Next.js middleware uses the new token
              const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
              const secure = window.location.protocol === 'https:' ? '; Secure' : ''
              document.cookie = `auth-token=${accessToken}; path=/; expires=${expires}; SameSite=Lax${secure}`
            }

            return accessToken
          })().finally(() => {
            refreshPromise = null
          })
        }

        const newAccessToken = await refreshPromise

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        return api(originalRequest)
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          const isNetworkError = (refreshError as any)?.code === 'ERR_NETWORK' || 
                                  (refreshError as any)?.code === 'ECONNABORTED'
          
          if (!isNetworkError) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
