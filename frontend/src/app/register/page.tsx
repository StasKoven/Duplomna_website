'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import s from './page.module.css'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Ім\'я має містити мінімум 2 символи'),
  lastName: z.string().min(2, 'Прізвище має містити мінімум 2 символи'),
  email: z.string().email('Невірний формат email'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Пароль має містити мінімум 8 символів')
    .regex(/[A-Z]/, 'Пароль має містити хоча б одну велику літеру')
    .regex(/[a-z]/, 'Пароль має містити хоча б одну малу літеру')
    .regex(/[0-9]/, 'Пароль має містити хоча б одну цифру'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Паролі не співпадають',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const register = useAuthStore(state => state.register)
  const googleLogin = useAuthStore(state => state.googleLogin)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      })
      router.push('/')
    } catch (error: any) {
      // Error toast is already shown in authStore
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true)
    try {
      await googleLogin()
      router.push('/')
    } catch (error: any) {
      console.error('Google register error:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className={s.wrapper}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={s.container}
      >
        <div className={s.header}>
          <h1 className={s.title}>Створити аккаунт</h1>
          <p className={s.subtitle}>
            Заповніть форму для реєстрації
          </p>
        </div>

        <div className={s.card}>
          <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
            <div className={s.gridRow}>
              <div>
                <label className={s.label}>
                  Ім'я *
                </label>
                <div className={s.inputWrapper}>
                  <User className={s.inputIcon} />
                  <input
                    {...registerField('firstName')}
                    type="text"
                    placeholder="Іван"
                    className={s.input}
                  />
                </div>
                {errors.firstName && (
                  <p className={s.error}>
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className={s.label}>
                  Прізвище *
                </label>
                <div className={s.inputWrapper}>
                  <User className={s.inputIcon} />
                  <input
                    {...registerField('lastName')}
                    type="text"
                    placeholder="Петренко"
                    className={s.input}
                  />
                </div>
                {errors.lastName && (
                  <p className={s.error}>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={s.label}>
                Email *
              </label>
              <div className={s.inputWrapper}>
                <Mail className={s.inputIcon} />
                <input
                  {...registerField('email')}
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
                Телефон
              </label>
              <div className={s.inputWrapper}>
                <Phone className={s.inputIcon} />
                <input
                  {...registerField('phone')}
                  type="tel"
                  placeholder="+380 XX XXX XX XX"
                  className={s.input}
                />
              </div>
              {errors.phone && (
                <p className={s.error}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className={s.gridRow}>
              <div>
                <label className={s.label}>
                  Пароль *
                </label>
                <div className={s.inputWrapper}>
                  <Lock className={s.inputIcon} />
                  <input
                    {...registerField('password')}
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

              <div>
                <label className={s.label}>
                  Підтвердіть пароль *
                </label>
                <div className={s.inputWrapper}>
                  <Lock className={s.inputIcon} />
                  <input
                    {...registerField('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={s.inputWithToggle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={s.togglePassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className={s.icon} />
                    ) : (
                      <Eye className={s.icon} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className={s.error}>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className={s.termsRow}>
              <input
                type="checkbox"
                required
                className={s.termsCheckbox}
              />
              <label className={s.termsLabel}>
                Я погоджуюся з{' '}
                <Link href="/terms" className={s.termsLink}>
                  умовами використання
                </Link>{' '}
                та{' '}
                <Link href="/privacy" className={s.termsLink}>
                  політикою конфіденційності
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={s.submitBtn}
            >
              {isLoading ? 'Завантаження...' : 'Зареєструватися'}
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
              onClick={handleGoogleRegister}
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
              {isGoogleLoading ? 'Завантаження...' : 'Зареєструватися через Google'}
            </button>
          </div>

          <div className={s.footerText}>
            <p className={s.footerP}>
              Вже є аккаунт?{' '}
              <Link
                href="/login"
                className={s.authLink}
              >
                Увійти
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
