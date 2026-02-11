'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

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
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Перевірте свою пошту</h1>
            <p className="text-muted-foreground">
              Ми надіслали інструкції для відновлення паролю на вказаний email.
              Перевірте свою поштову скриньку.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6 text-sm text-muted-foreground">
            <p className="mb-2">Не отримали листа?</p>
            <ul className="space-y-1 text-left">
              <li>• Перевірте папку "Спам"</li>
              <li>• Переконайтесь, що email введено правильно</li>
              <li>• Спробуйте ще раз через кілька хвилин</li>
            </ul>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Повернутися до входу
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад до входу
          </Link>
          <h1 className="text-3xl font-bold mb-2">Забули пароль?</h1>
          <p className="text-muted-foreground">
            Введіть свій email, і ми надішлемо інструкції для відновлення паролю
          </p>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-lg border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email адреса
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Відправка...' : 'Відновити пароль'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Згадали пароль?{' '}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Увійти
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">💡 Підказка:</p>
          <p>
            Для тестування використовуйте email: <strong>admin@electronics.com</strong>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
