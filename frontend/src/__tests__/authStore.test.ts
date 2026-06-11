// Regression coverage for the mobile "logged in but bounced to /login" bug.
//
// The Next.js middleware gates protected routes (/profile, /wishlist, ...) on
// the *presence* of the `auth-token` cookie. Mobile browsers can drop a
// script-set cookie while localStorage keeps the tokens, so on restore the
// client believes it is authenticated but the middleware redirects to /login.
// The fix re-asserts the cookie whenever the session is confirmed valid.

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}))

import api from '@/lib/api'
import { useAuthStore, setAuthCookie } from '@/store/authStore'

const mockedApi = api as jest.Mocked<typeof api>

const clearCookies = () => {
  document.cookie
    .split(';')
    .forEach((c) => {
      const name = c.split('=')[0].trim()
      if (name) document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
}

describe('authStore — middleware cookie restoration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    clearCookies()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
    // Default: any store-sync fan-out call resolves harmlessly.
    mockedApi.get.mockResolvedValue({ data: {} } as never)
  })

  it('setAuthCookie writes the auth-token cookie', () => {
    setAuthCookie('tok123')
    expect(document.cookie).toContain('auth-token=tok123')
  })

  it('fetchProfile re-sets the auth-token cookie on success (cookie-drop recovery)', async () => {
    // localStorage kept the token, but the cookie was dropped by the browser.
    localStorage.setItem('accessToken', 'valid-access-token')
    expect(document.cookie).not.toContain('auth-token')

    mockedApi.get.mockImplementation((url?: string) =>
      url === '/auth/profile'
        ? (Promise.resolve({ data: { user: { id: 'u1', email: 'a@b.c' } } }) as never)
        : (Promise.resolve({ data: {} }) as never)
    )

    await useAuthStore.getState().fetchProfile()

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(document.cookie).toContain('auth-token=valid-access-token')
  })

  it('fetchProfile clears the cookie + tokens on a 401 (genuine session loss)', async () => {
    setAuthCookie('stale-token')
    localStorage.setItem('accessToken', 'stale-token')
    localStorage.setItem('refreshToken', 'stale-refresh')
    expect(document.cookie).toContain('auth-token=stale-token')

    mockedApi.get.mockRejectedValue({ response: { status: 401 } } as never)

    await useAuthStore.getState().fetchProfile()

    expect(document.cookie).not.toContain('auth-token=stale-token')
    expect(localStorage.getItem('accessToken')).toBeNull()
  })
})
