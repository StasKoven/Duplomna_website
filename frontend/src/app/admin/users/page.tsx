'use client'

import type { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Search, Shield, Trash2, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import s from './page.module.css'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
}

type UserRole = 'user' | 'admin'

type ApiErrorResponse = {
  message?: string
}

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  const axiosError = error as AxiosError<ApiErrorResponse>
  return axiosError.response?.data?.message || fallbackMessage
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingKey, setProcessingKey] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/users')
    } else if (user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchUsers()
    }
  }, [isAuthenticated, user, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error(getErrorMessage(error, 'Не вдалося завантажити користувачів'))
    } finally {
      setLoading(false)
    }
  }

  const currentUserId = user?.id
  const activeUsersCount = users.filter((item) => item.isActive).length
  const adminUsersCount = users.filter((item) => item.role === 'admin').length
  const bannedUsersCount = users.length - activeUsersCount

  const updateLocalUser = (userId: string, changes: Partial<User>) => {
    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item._id === userId ? { ...item, ...changes } : item
      )
    )
  }

  const handleRoleChange = async (targetUser: User, nextRole: UserRole) => {
    if (targetUser.role === nextRole) {
      return
    }

    setProcessingKey(`${targetUser._id}:role`)

    try {
      await api.put(`/users/${targetUser._id}`, { role: nextRole })
      updateLocalUser(targetUser._id, { role: nextRole })
      toast.success(
        nextRole === 'admin'
          ? 'Користувачу надано права адміністратора'
          : 'Права користувача оновлено'
      )
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не вдалося змінити роль'))
    } finally {
      setProcessingKey(null)
    }
  }

  const handleToggleStatus = async (targetUser: User) => {
    const nextIsActive = !targetUser.isActive
    const actionLabel = nextIsActive ? 'розблокувати' : 'забанити'

    if (!confirm(`Ви впевнені, що хочете ${actionLabel} користувача ${targetUser.email}?`)) {
      return
    }

    setProcessingKey(`${targetUser._id}:status`)

    try {
      await api.put(`/users/${targetUser._id}`, { isActive: nextIsActive })
      updateLocalUser(targetUser._id, { isActive: nextIsActive })
      toast.success(nextIsActive ? 'Користувача розблоковано' : 'Користувача заблоковано')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не вдалося оновити статус'))
    } finally {
      setProcessingKey(null)
    }
  }

  const handleDeleteUser = async (targetUser: User) => {
    if (!confirm(`Ви впевнені, що хочете видалити користувача ${targetUser.email}? Цю дію не можна скасувати.`)) {
      return
    }

    setProcessingKey(`${targetUser._id}:delete`)

    try {
      await api.delete(`/users/${targetUser._id}`)
      setUsers((currentUsers) => currentUsers.filter((item) => item._id !== targetUser._id))
      toast.success('Користувача видалено')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Не вдалося видалити користувача'))
    } finally {
      setProcessingKey(null)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Користувачі</h1>
          <p className={s.subtitle}>
            Керуйте ролями, доступом і акаунтами користувачів
          </p>
        </div>
      </div>

      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <span className={s.statLabel}>Всього</span>
          <strong className={s.statValue}>{users.length}</strong>
        </div>
        <div className={s.statCard}>
          <span className={s.statLabel}>Активні</span>
          <strong className={s.statValue}>{activeUsersCount}</strong>
        </div>
        <div className={s.statCard}>
          <span className={s.statLabel}>Адміністратори</span>
          <strong className={s.statValue}>{adminUsersCount}</strong>
        </div>
        <div className={s.statCard}>
          <span className={s.statLabel}>Заблоковані</span>
          <strong className={s.statValue}>{bannedUsersCount}</strong>
        </div>
      </div>

      <div className={s.searchWrapper}>
        <div className={s.searchContainer}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            placeholder="Пошук користувачів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={s.loading}>Завантаження...</div>
      ) : (
        <div className={s.tableContainer}>
          <div className={s.tableScroll}>
            <table className={s.table}>
              <thead className={s.thead}>
                <tr>
                  <th className={s.th}>Користувач</th>
                  <th className={s.th}>Email</th>
                  <th className={s.th}>Роль</th>
                  <th className={s.th}>Статус</th>
                  <th className={s.th}>Дата реєстрації</th>
                  <th className={s.thActions}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className={s.tr}>
                    <td className={s.td}>
                      <div className={s.userCell}>
                        <div className={s.avatar}>
                          {u.role === 'admin' ? (
                            <Shield className={s.avatarIcon} />
                          ) : (
                            <UserIcon className={s.avatarIcon} />
                          )}
                        </div>
                        <div>
                          <div className={s.userName}>
                            {u.firstName} {u.lastName}
                          </div>
                          {u._id === currentUserId && (
                            <div className={s.currentUserNote}>Це ваш акаунт</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={s.td}>
                      <div className={s.email}>{u.email}</div>
                      {u.emailVerified && (
                        <div className={s.verified}>
                          ✓ Підтверджено
                        </div>
                      )}
                    </td>
                    <td className={s.td}>
                      <div className={s.roleCell}>
                        <span
                          className={`${s.badge} ${
                            u.role === 'admin'
                              ? s.roleAdmin
                              : s.roleUser
                          }`}
                        >
                          {u.role === 'admin' ? 'Адміністратор' : 'Користувач'}
                        </span>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                          className={s.select}
                          disabled={processingKey !== null || u._id === currentUserId}
                        >
                          <option value="user">Користувач</option>
                          <option value="admin">Адміністратор</option>
                        </select>
                      </div>
                    </td>
                    <td className={s.td}>
                      <div className={s.statusCell}>
                        <span
                          className={`${s.badge} ${
                            u.isActive
                              ? s.statusActive
                              : s.statusInactive
                          }`}
                        >
                          {u.isActive ? 'Активний' : 'Заблокований'}
                        </span>
                        <button
                          type="button"
                          className={s.secondaryAction}
                          onClick={() => handleToggleStatus(u)}
                          disabled={processingKey !== null || u._id === currentUserId}
                        >
                          {u.isActive ? 'Забанити' : 'Розбанити'}
                        </button>
                      </div>
                    </td>
                    <td className={s.tdDate}>
                      {new Date(u.createdAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td className={s.actionsCell}>
                      <button
                        type="button"
                        className={s.deleteAction}
                        onClick={() => handleDeleteUser(u)}
                        disabled={processingKey !== null || u._id === currentUserId}
                        title="Видалити користувача"
                      >
                        <Trash2 className={s.deleteIcon} />
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className={s.emptyState}>
              {searchTerm ? 'Користувачів не знайдено' : 'Немає користувачів'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
