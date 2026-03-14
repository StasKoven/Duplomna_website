'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart, Users, Package, DollarSign,
  TrendingUp, BarChart3, PieChart as PieChartIcon,
  Settings, Tag, Ticket, ChevronRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import s from './page.module.css'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Очікує',
  processing: 'В обробці',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
}

const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444']

interface DashboardData {
  totals: {
    orders: number
    users: number
    products: number
    revenue: number
    newOrders: number
    newUsers: number
  }
  dailyStats: { date: string; revenue: number; orders: number }[]
  ordersByStatus: { status: string; count: number }[]
  topProducts: { name: string; sold: number; revenue: number }[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/')
      return
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/orders/dashboard-stats')
        setData(response.data)
      } catch {
        toast.error('Помилка завантаження статистики')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user, router])

  const formatPrice = (n: number) => n.toLocaleString('uk-UA') + ' ₴'
  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className={`container-custom ${s.page}`}>
        <div className={s.loadingGrid}>
          {[...Array(4)].map((_, i) => <div key={i} className={s.loadingCard} />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  const adminLinks = [
    { href: '/admin/orders', icon: ShoppingCart, label: 'Замовлення', desc: 'Керування замовленнями' },
    { href: '/admin/products', icon: Package, label: 'Товари', desc: 'Каталог та створення' },
    { href: '/admin/categories', icon: Tag, label: 'Категорії', desc: 'Категорії товарів' },
    { href: '/admin/users', icon: Users, label: 'Користувачі', desc: 'Управління користувачами' },
    { href: '/admin/coupons', icon: Settings, label: 'Купони', desc: 'Промокоди та знижки' },
    { href: '/admin/tickets', icon: Ticket, label: 'Підтримка', desc: 'Тікети підтримки' },
  ]

  return (
    <div className={`container-custom ${s.page}`}>
      <h1 className={s.pageTitle}>Адмін-панель</h1>

      {/* Stat Cards */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <div className={s.statIconWrap} style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
            <ShoppingCart style={{ color: '#3b82f6' }} className={s.statIcon} />
          </div>
          <div>
            <p className={s.statLabel}>Замовлення</p>
            <p className={s.statValue}>{data.totals.orders}</p>
            <p className={s.statExtra}>+{data.totals.newOrders} за місяць</p>
          </div>
        </div>
        <div className={s.statCard}>
          <div className={s.statIconWrap} style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
            <DollarSign style={{ color: '#22c55e' }} className={s.statIcon} />
          </div>
          <div>
            <p className={s.statLabel}>Дохід</p>
            <p className={s.statValue}>{formatPrice(data.totals.revenue)}</p>
          </div>
        </div>
        <div className={s.statCard}>
          <div className={s.statIconWrap} style={{ backgroundColor: 'rgba(168,85,247,0.1)' }}>
            <Users style={{ color: '#a855f7' }} className={s.statIcon} />
          </div>
          <div>
            <p className={s.statLabel}>Користувачі</p>
            <p className={s.statValue}>{data.totals.users}</p>
            <p className={s.statExtra}>+{data.totals.newUsers} за місяць</p>
          </div>
        </div>
        <div className={s.statCard}>
          <div className={s.statIconWrap} style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
            <Package style={{ color: '#f59e0b' }} className={s.statIcon} />
          </div>
          <div>
            <p className={s.statLabel}>Товари</p>
            <p className={s.statValue}>{data.totals.products}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={s.chartsGrid}>
        {/* Revenue Line Chart */}
        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <TrendingUp className={s.chartIcon} />
            <h2 className={s.chartTitle}>Дохід за 7 днів</h2>
          </div>
          <div className={s.chartBody}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => [formatPrice(Number(value)), 'Дохід']}
                  labelFormatter={(label) => formatDay(String(label))}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <PieChartIcon className={s.chartIcon} />
            <h2 className={s.chartTitle}>Статуси замовлень</h2>
          </div>
          <div className={s.chartBody}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.ordersByStatus.map(s => ({ ...s, name: STATUS_LABELS[s.status] || s.status }))}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                >
                  {data.ordersByStatus.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {data.topProducts.length > 0 && (
        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <BarChart3 className={s.chartIcon} />
            <h2 className={s.chartTitle}>Топ-5 товарів</h2>
          </div>
          <div className={s.chartBody}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value, name) => [name === 'sold' ? `${value} шт.` : formatPrice(Number(value)), name === 'sold' ? 'Продано' : 'Дохід']}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="sold" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Admin Navigation */}
      <h2 className={s.sectionTitle}>Швидкі посилання</h2>
      <div className={s.linksGrid}>
        {adminLinks.map(link => (
          <Link key={link.href} href={link.href} className={s.linkCard}>
            <link.icon className={s.linkIcon} />
            <div>
              <p className={s.linkLabel}>{link.label}</p>
              <p className={s.linkDesc}>{link.desc}</p>
            </div>
            <ChevronRight className={s.linkArrow} />
          </Link>
        ))}
      </div>
    </div>
  )
}
