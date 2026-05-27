import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalize the no-break (U+00A0) and narrow no-break (U+202F) spaces that
// Intl emits to a regular space. Node and Chrome ship different ICU versions
// that disagree on which of these to use for uk-UA currency formatting, so the
// raw output differs between SSR and the client — a hydration text mismatch
// (React #425) that forces a full-root client re-render (#422) and tanks LCP.
// Normalizing makes the string byte-identical everywhere.
const normalizeSpaces = (s: string): string => s.replace(/[  ]/g, ' ')

export function formatPrice(price: number): string {
  return normalizeSpaces(
    new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
    }).format(price)
  )
}

export function formatDate(date: string | Date): string {
  return normalizeSpaces(
    new Intl.DateTimeFormat('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  )
}

export function getImageUrl(url: string): string {
  if (!url) return '/placeholder.png'
  if (url.startsWith('http')) return url
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  return `${base}/${url.replace(/^\/+/, '')}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
