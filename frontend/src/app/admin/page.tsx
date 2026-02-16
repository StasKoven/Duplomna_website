'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LayoutDashboard, Package, FolderOpen, Users, ShoppingCart, MessageSquare } from 'lucide-react'
import Link from 'next/link'

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
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Панель адміністратора</h1>
        <p className="text-muted-foreground">
          Вітаємо, {user.firstName} {user.lastName}!
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block group"
            >
              <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-all group-hover:scale-105">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
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
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Швидка статистика</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Всього товарів
            </div>
            <div className="text-3xl font-bold">-</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Активних замовлень
            </div>
            <div className="text-3xl font-bold">-</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Користувачів
            </div>
            <div className="text-3xl font-bold">-</div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Дохід (місяць)
            </div>
            <div className="text-3xl font-bold">-</div>
          </div>
        </div>
      </div>
    </div>
  )
}
