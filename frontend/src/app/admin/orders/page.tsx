'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { Package, Clock, CheckCircle, XCircle, Search } from 'lucide-react'
import s from './page.module.css'

interface Order {
  _id: string
  orderNumber: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  items: Array<{
    product: any
    quantity: number
    price: number
  }>
  total: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/orders')
    } else if (user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchOrders()
    }
  }, [isAuthenticated, user, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders/all')
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className={s.iconDelivered} />
      case 'cancelled':
        return <XCircle className={s.iconCancelled} />
      case 'processing':
        return <Clock className={s.iconProcessing} />
      default:
        return <Package className={s.iconDefault} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return s.statusDelivered
      case 'cancelled':
        return s.statusCancelled
      case 'processing':
        return s.statusProcessing
      case 'shipped':
        return s.statusShipped
      default:
        return s.statusDefault
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.header}>
        <h1 className={s.title}>Замовлення</h1>
        <p className={s.subtitle}>
          Всього замовлень: {orders.length}
        </p>
      </div>

      {/* Search */}
      <div className={s.searchWrapper}>
        <div className={s.searchContainer}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            placeholder="Пошук за номером або email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={s.loading}>Завантаження...</div>
      ) : filteredOrders.length === 0 ? (
        <div className={s.emptyState}>
          <Package className={s.emptyIcon} />
          <h3 className={s.emptyTitle}>
            {searchTerm ? 'Замовлення не знайдено' : 'Немає замовлень'}
          </h3>
          <p className={s.emptyText}>
            {searchTerm
              ? 'Спробуйте змінити параметри пошуку'
              : 'Замовлення з\'являться тут після оформлення'}
          </p>
        </div>
      ) : (
        <div className={s.ordersList}>
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className={s.orderCard}
            >
              <div className={s.orderHeader}>
                <div>
                  <div className={s.orderNumberRow}>
                    <h3 className={s.orderNumber}>
                      #{order.orderNumber}
                    </h3>
                    <div
                      className={`${s.statusBadge} ${getStatusColor(order.orderStatus)}`}
                    >
                      {getStatusIcon(order.orderStatus)}
                      <span className={s.statusText}>{order.orderStatus}</span>
                    </div>
                  </div>
                  <p className={s.detailText}>
                    Клієнт: {order.user.firstName} {order.user.lastName} (
                    {order.user.email})
                  </p>
                  <p className={s.detailText}>
                    Дата: {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                  </p>
                </div>
                <div className={s.orderRight}>
                  <p className={s.orderPrice}>
                    {formatPrice(order.total)}
                  </p>
                  <p className={s.detailText}>
                    {order.items.length} товар(ів)
                  </p>
                </div>
              </div>

              <div className={s.itemsSection}>
                <h4 className={s.itemsTitle}>Товари:</h4>
                <div className={s.itemsList}>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className={s.itemRow}
                    >
                      <span>
                        {item.product?.name || 'Товар видалено'} x{' '}
                        {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
