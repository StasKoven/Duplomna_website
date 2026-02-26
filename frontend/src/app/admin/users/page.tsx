'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Search, Shield, User as UserIcon } from 'lucide-react'
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

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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
      console.log('🔍 Fetching users...')
      setLoading(true)
      const response = await api.get('/users', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      console.log('✅ Users fetched:', response.data)
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('❌ Error fetching users:', error)
    } finally {
      setLoading(false)
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
        <h1 className={s.title}>Користувачі</h1>
        <p className={s.subtitle}>
          Всього користувачів: {users.length}
        </p>
      </div>

      {/* Search */}
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
                      <span
                        className={`${s.badge} ${
                          u.role === 'admin'
                            ? s.roleAdmin
                            : s.roleUser
                        }`}
                      >
                        {u.role === 'admin' ? 'Адміністратор' : 'Користувач'}
                      </span>
                    </td>
                    <td className={s.td}>
                      <span
                        className={`${s.badge} ${
                          u.isActive
                            ? s.statusActive
                            : s.statusInactive
                        }`}
                      >
                        {u.isActive ? 'Активний' : 'Неактивний'}
                      </span>
                    </td>
                    <td className={s.tdDate}>
                      {new Date(u.createdAt).toLocaleDateString('uk-UA')}
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
