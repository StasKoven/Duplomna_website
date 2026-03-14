import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/admin', '/profile', '/orders', '/wishlist', '/checkout']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for auth token in cookie (set by client after login)
  const authToken = request.cookies.get('auth-token')?.value
  const isAuthenticated = !!authToken

  // Protect private routes - redirect to login if not authenticated
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some(route => pathname === route)
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/checkout/:path*',
    '/login',
    '/register',
  ],
}
