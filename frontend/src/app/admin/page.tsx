'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LayoutDashboard, Package, FolderOpen, Users, ShoppingCart, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import s from './page.module.css'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin')
    } else if (user?.role !== 'admin') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null
  }

  const menuItems = [
    {
      title: 'Огляд',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Загальна статистика',
    },
    {
      title: 'Товари',
      href: '/admin/products',
      icon: Package,
      description: 'Керування товарами',
    },
    {
      title: 'Категорії',
      href: '/admin/categories',
      icon: FolderOpen,
      description: 'Керування категоріями',
    },
    {
      title: 'Замовлення',
      href: '/admin/orders',
      icon: ShoppingCart,
      description: 'Перегляд замовлень',
    },
    {
      title: 'Користувачі',
      href: '/admin/users',
      icon: Users,
      description: 'Керування користувачами',
    },
    {
      title: 'Підтримка',
      href: '/admin/tickets',
      icon: MessageSquare,
      description: 'Відповіді на запити',
    },
  ]

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.header}>
        <h1 className={s.title}>Панель адміністратора</h1>
        <p className={s.subtitle}>
          Вітаємо, {user.firstName} {user.lastName}!
        </p>
      </div>

      <div className={s.menuGrid}>
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${s.menuLink} group`}
            >
              <div className={s.menuCard}>
                <div className={s.menuCardContent}>
                  <div className={s.menuIconWrap}>
                    <Icon className={s.menuIcon} />
                  </div>
                  <div>
                    <h3 className={s.menuTitle}>{item.title}</h3>
                    <p className={s.menuDescription}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className={s.statsSection}>
        <h2 className={s.statsTitle}>Швидка статистика</h2>
        <div className={s.statsGrid}>
          <div className={s.statCard}>
            <div className={s.statLabel}>
              Всього товарів
            </div>
            <div className={s.statValue}>-</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statLabel}>
              Активних замовлень
            </div>
            <div className={s.statValue}>-</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statLabel}>
              Користувачів
            </div>
            <div className={s.statValue}>-</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statLabel}>
              Дохід (місяць)
            </div>
            <div className={s.statValue}>-</div>
          </div>
        </div>
      </div>
    </div>
  )
}
