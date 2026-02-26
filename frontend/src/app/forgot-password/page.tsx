'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import s from './page.module.css'

const forgotPasswordSchema = z.object({
  email: z.string().email('Невірний формат email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      // TODO: Реалізувати API для відновлення паролю
      // await api.post('/auth/forgot-password', data)
      
      // Тимчасова заглушка
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEmailSent(true)
      toast.success('Інструкції надіслано на ваш email!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка відправки')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className={s.wrapper}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={s.successContainer}
        >
          <div className={s.successHeader}>
            <div className={s.successIconWrap}>
              <Mail className={s.successIcon} />
            </div>
            <h1 className={s.title}>Перевірте свою пошту</h1>
            <p className={s.subtitle}>
              Ми надіслали інструкції для відновлення паролю на вказаний email.
              Перевірте свою поштову скриньку.
            </p>
          </div>

          <div className={s.hintBox}>
            <p className={s.hintTitle}>Не отримали листа?</p>
            <ul className={s.hintList}>
              <li>• Перевірте папку "Спам"</li>
              <li>• Переконайтесь, що email введено правильно</li>
              <li>• Спробуйте ще раз через кілька хвилин</li>
            </ul>
          </div>

          <Link
            href="/login"
            className={s.backLink}
          >
            <ArrowLeft className={s.backIcon} />
            Повернутися до входу
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={s.wrapper}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={s.container}
      >
        <div className={s.headerSection}>
          <Link
            href="/login"
            className={s.backToLogin}
          >
            <ArrowLeft className={s.backIcon} />
            Назад до входу
          </Link>
          <h1 className={s.title}>Забули пароль?</h1>
          <p className={s.subtitle}>
            Введіть свій email, і ми надішлемо інструкції для відновлення паролю
          </p>
        </div>

        <div className={s.card}>
          <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
            <div>
              <label className={s.label}>
                Email адреса
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

            <button
              type="submit"
              disabled={isLoading}
              className={s.submitBtn}
            >
              {isLoading ? 'Відправка...' : 'Відновити пароль'}
            </button>
          </form>

          <div className={s.footerText}>
            <p className={s.footerP}>
              Згадали пароль?{' '}
              <Link
                href="/login"
                className={s.authLink}
              >
                Увійти
              </Link>
            </p>
          </div>
        </div>

        <div className={s.tipBox}>
          <p className={s.tipTitle}>💡 Підказка:</p>
          <p>
            Для тестування використовуйте email: <strong>admin@electronics.com</strong>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
