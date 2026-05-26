'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import s from './page.module.css'

const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль має містити мінімум 6 символів'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const login = useAuthStore(state => state.login)
  const googleLogin = useAuthStore(state => state.googleLogin)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [isAuthenticated, redirectTo, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      // toast вже показується в authStore
      
      router.replace(redirectTo)
    } catch (error: any) {
      // Помилка вже показується в authStore, але на всяк випадок
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      await googleLogin()
      router.replace(redirectTo)
    } catch (error: any) {
      console.error('Google login error:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className={s.wrapper}>
      <div className={`${s.container} ${s.containerEnter}`}>
        <div className={s.header}>
          <h1 className={s.title}>Вхід до аккаунту</h1>
          <p className={s.subtitle}>
            Введіть свої дані для входу
          </p>
        </div>

        <div className={s.card}>
          <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
            <div>
              <label className={s.label}>
                Email
              </label>
              <div className={s.inputWrapper}>
                <Mail className={s.inputIcon} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  className={s.input}
                />
              </div>
              {errors.email && (
                <p className={s.error}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className={s.label}>
                Пароль
              </label>
              <div className={s.inputWrapper}>
                <Lock className={s.inputIcon} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={s.inputWithToggle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={s.togglePassword}
                >
                  {showPassword ? (
                    <EyeOff className={s.icon} />
                  ) : (
                    <Eye className={s.icon} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className={s.error}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className={s.rememberRow}>
              <Link
                href="/forgot-password"
                className={s.forgotLink}
              >
                Забули пароль?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={s.submitBtn}
            >
              {isLoading ? 'Завантаження...' : 'Увійти'}
            </button>
          </form>

          <div className={s.dividerSection}>
            <div className={s.divider}>
              <div className={s.dividerLine}>
                <div className={s.dividerBorder}></div>
              </div>
              <div className={s.dividerTextWrap}>
                <span className={s.dividerSpan}>
                  або
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className={s.googleBtn}
            >
              <svg className={s.googleIcon} viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isGoogleLoading ? 'Завантаження...' : 'Увійти через Google'}
            </button>
          </div>

          <div className={s.footerText}>
            <p className={s.footerP}>
              Ще немає аккаунту?{' '}
              <Link
                href="/register"
                className={s.authLink}
              >
                Зареєструватися
              </Link>
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className={s.dividerSection}>
              <div className={s.divider}>
                <div className={s.dividerLine}>
                  <div className={s.dividerBorder}></div>
                </div>
                <div className={s.dividerTextWrap}>
                  <span className={s.dividerSpan}>
                    Для тестування
                  </span>
                </div>
              </div>
              <div className={s.testInfo}>
                <p className={s.testInfoTitle}>Тестовий аккаунт адміністратора:</p>
                <p className={s.testInfoText}>Email: admin@electronics.com</p>
                <p className={s.testInfoText}>Пароль: Admin123!@#</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className={s.loadingWrapper}>
      <div className={s.loadingText}>Завантаження...</div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
