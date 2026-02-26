'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { User, Mail, Lock, Save } from 'lucide-react'
import { toast } from 'sonner'
import s from './page.module.css'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile')
    } else if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [isAuthenticated, user, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put('/users/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
      })

      setUser(response.data.user)
      toast.success('Профіль успішно оновлено')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка оновлення профілю')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Паролі не співпадають')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Пароль повинен містити щонайменше 6 символів')
      return
    }

    setLoading(true)

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      toast.success('Пароль успішно змінено')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка зміни пароля')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.contentWrapper}>
        <div className={s.header}>
          <h1 className={s.title}>Мій профіль</h1>
          <p className={s.subtitle}>
            Керуйте своїми особистими даними
          </p>
        </div>

        {/* Tabs */}
        <div className={s.tabs}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`${s.tabBtn} ${
              activeTab === 'profile'
                ? s.tabBtnActive
                : s.tabBtnInactive
            }`}
          >
            <div className={s.tabBtnContent}>
              <User className={s.tabIcon} />
              Особисті дані
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`${s.tabBtn} ${
              activeTab === 'password'
                ? s.tabBtnActive
                : s.tabBtnInactive
            }`}
          >
            <div className={s.tabBtnContent}>
              <Lock className={s.tabIcon} />
              Змінити пароль
            </div>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={s.card}>
            <form onSubmit={handleProfileUpdate} className={s.form}>
              <div className={s.formGrid}>
                <div>
                  <label className={s.label}>
                    Ім'я
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    className={`input ${s.inputFull}`}
                    required
                  />
                </div>
                <div>
                  <label className={s.label}>
                    Прізвище
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    className={`input ${s.inputFull}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={s.label}>
                  Email
                </label>
                <div className={s.emailWrapper}>
                  <Mail className={s.emailIcon} />
                  <input
                    type="email"
                    value={profileData.email}
                    className={`input ${s.emailInput}`}
                    disabled
                  />
                </div>
                <p className={s.hint}>
                  Email не може бути змінений
                </p>
              </div>

              <div>
                <label className={s.label}>
                  Телефон
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className={`input ${s.inputFull}`}
                  placeholder="+380"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${s.submitBtn}`}
              >
                <Save className={s.btnIcon} />
                {loading ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className={s.card}>
            <form onSubmit={handlePasswordChange} className={s.form}>
              <div>
                <label className={s.label}>
                  Поточний пароль
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className={`input ${s.inputFull}`}
                  required
                />
              </div>

              <div>
                <label className={s.label}>
                  Новий пароль
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className={`input ${s.inputFull}`}
                  required
                  minLength={6}
                />
                <p className={s.hint}>
                  Мінімум 6 символів
                </p>
              </div>

              <div>
                <label className={s.label}>
                  Підтвердити новий пароль
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`input ${s.inputFull}`}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${s.submitBtn}`}
              >
                <Lock className={s.btnIcon} />
                {loading ? 'Зміна паролю...' : 'Змінити пароль'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
