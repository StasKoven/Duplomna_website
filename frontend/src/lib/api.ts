import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const isProduction = process.env.NODE_ENV === 'production'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: isProduction ? 30000 : 10000,
})

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

        const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
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
