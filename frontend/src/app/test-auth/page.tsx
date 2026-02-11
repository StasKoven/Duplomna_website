'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function TestAuthPage() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageToken(localStorage.getItem('accessToken'))
    }
  }, [])

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">🔐 Тест автентифікації</h1>
      
      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Auth Store State</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><span className="text-muted-foreground">isAuthenticated:</span> {isAuthenticated ? '✅ true' : '❌ false'}</p>
            <p><span className="text-muted-foreground">user:</span> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            <p><span className="text-muted-foreground">accessToken (store):</span> {accessToken ? `${accessToken.substring(0, 30)}...` : 'null'}</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><span className="text-muted-foreground">accessToken:</span> {localStorageToken ? `${localStorageToken.substring(0, 30)}...` : 'null'}</p>
            <p><span className="text-muted-foreground">refreshToken:</span> {typeof window !== 'undefined' ? (localStorage.getItem('refreshToken') ? 'Present' : 'null') : 'SSR'}</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Дії</h2>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  console.log('localStorage tokens:', {
                    accessToken: localStorage.getItem('accessToken'),
                    refreshToken: localStorage.getItem('refreshToken')
                  })
                }
              }}
              className="btn-primary"
            >
              Log Tokens to Console
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('accessToken')
                  localStorage.removeItem('refreshToken')
                  window.location.reload()
                }
              }}
              className="btn-secondary"
            >
              Clear Tokens & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
