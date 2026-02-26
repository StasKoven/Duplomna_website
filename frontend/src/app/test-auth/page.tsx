'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import s from './page.module.css'

export default function TestAuthPage() {
  const { user, isAuthenticated, accessToken } = useAuthStore()
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageToken(localStorage.getItem('accessToken'))
    }
  }, [])

  return (
    <div className={`container-custom ${s.page}`}>
      <h1 className={s.title}>🔐 Тест автентифікації</h1>
      
      <div className={s.sections}>
        <div className={s.card}>
          <h2 className={s.cardTitle}>Auth Store State</h2>
          <div className={s.infoList}>
            <p><span className={s.label}>isAuthenticated:</span> {isAuthenticated ? '✅ true' : '❌ false'}</p>
            <p><span className={s.label}>user:</span> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            <p><span className={s.label}>accessToken (store):</span> {accessToken ? `${accessToken.substring(0, 30)}...` : 'null'}</p>
          </div>
        </div>

        <div className={s.card}>
          <h2 className={s.cardTitle}>LocalStorage</h2>
          <div className={s.infoList}>
            <p><span className={s.label}>accessToken:</span> {localStorageToken ? `${localStorageToken.substring(0, 30)}...` : 'null'}</p>
            <p><span className={s.label}>refreshToken:</span> {typeof window !== 'undefined' ? (localStorage.getItem('refreshToken') ? 'Present' : 'null') : 'SSR'}</p>
          </div>
        </div>

        <div className={s.card}>
          <h2 className={s.cardTitle}>Дії</h2>
          <div className={s.actions}>
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
