/**
 * Global error logger for frontend
 * Only outputs in development mode to keep production console clean
 */

const isDev = process.env.NODE_ENV !== 'production'

export const logError = (context: string, error: any, additionalInfo?: any) => {
  if (!isDev) return
  console.error('[Error]', context, '', error?.message || error)
  if (error?.response) {
    console.error('Status:', error.response.status, error.response.data?.message || '')
  }
  if (additionalInfo) {
    console.error('Info:', additionalInfo)
  }
}

export const logWarning = (context: string, message: string, data?: any) => {
  if (!isDev) return
  console.warn('[Warning]', context, '', message, data ?? '')
}

export const logInfo = (context: string, message: string, data?: any) => {
  if (!isDev) return
  console.info('[Info]', context, '', message, data ?? '')
}
