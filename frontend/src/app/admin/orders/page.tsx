'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'
import s from './page.module.css'

const ORDER_STATUSES = [
  { value: 'pending', label: 'Очікує' },
  { value: 'processing', label: 'В обробці' },
  { value: 'shipped', label: 'Відправлено' },
  { value: 'delivered', label: 'Доставлено' },
  { value: 'cancelled', label: 'Скасовано' },
] as const

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Очікує оплати' },
  { value: 'paid', label: 'Оплачено' },
  { value: 'failed', label: 'Помилка' },
  { value: 'refunded', label: 'Повернуто' },
] as const

type OrderStatus = (typeof ORDER_STATUSES)[number]['value']
type PaymentStatus = (typeof PAYMENT_STATUSES)[number]['value']

interface ShippingAddress {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  street?: string
  city?: string
  zipCode?: string
  country?: string
  novaPoshtaWarehouse?: string
  deliveryMethod?: string
}

interface Order {
  _id: string
  orderNumber: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  items: Array<{
    product: any
    name?: string
    image?: string
    quantity: number
    price: number
  }>
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  trackingNumber?: string
  shippingAddress: ShippingAddress
  createdAt: string
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Усі' },
  ...ORDER_STATUSES,
] as const

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  // Local edit state — keyed by order id
  const [edits, setEdits] = useState<Record<string, Partial<Order> & { note?: string }>>({})

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
      toast.error('Не вдалось завантажити замовлення')
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
      case 'shipped':
        return <Truck className={s.iconProcessing} />
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

  const statusLabel = (value: string) =>
    ORDER_STATUSES.find((o) => o.value === value)?.label || value

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) return false
      const term = searchTerm.toLowerCase()
      if (!term) return true
      return (
        order.orderNumber.toLowerCase().includes(term) ||
        order.user?.email?.toLowerCase().includes(term) ||
        `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.toLowerCase().includes(term)
      )
    })
  }, [orders, searchTerm, statusFilter])

  const getEdit = (order: Order) => edits[order._id] || {}

  const setEditField = <K extends keyof Order | 'note'>(orderId: string, key: K, value: any) => {
    setEdits((prev) => ({ ...prev, [orderId]: { ...prev[orderId], [key]: value } }))
  }

  const hasChanges = (order: Order) => {
    const e = getEdit(order)
    return (
      (e.orderStatus !== undefined && e.orderStatus !== order.orderStatus) ||
      (e.paymentStatus !== undefined && e.paymentStatus !== order.paymentStatus) ||
      (e.trackingNumber !== undefined && (e.trackingNumber || '') !== (order.trackingNumber || '')) ||
      Boolean(e.note && e.note.trim())
    )
  }

  const saveChanges = async (order: Order) => {
    const e = getEdit(order)
    const orderStatus = e.orderStatus ?? order.orderStatus
    const paymentStatus = e.paymentStatus ?? order.paymentStatus
    const trackingNumber = e.trackingNumber ?? order.trackingNumber ?? ''
    const note = (e.note || '').trim()

    try {
      setSavingId(order._id)
      // Status + tracking + note are accepted by /status. Payment status is updated
      // separately if it changed (via a tiny PATCH). The backend currently only
      // accepts orderStatus through this endpoint, so payment changes are sent
      // through the same endpoint by including paymentStatus alongside (extended
      // backend below).
      await api.put(`/orders/${order._id}/status`, {
        orderStatus,
        trackingNumber: trackingNumber || undefined,
        note: note || undefined,
        paymentStatus,
      })

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? { ...o, orderStatus, paymentStatus, trackingNumber }
            : o
        )
      )
      setEdits((prev) => {
        const next = { ...prev }
        delete next[order._id]
        return next
      })
      toast.success('Замовлення оновлено')
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Не вдалось оновити замовлення')
    } finally {
      setSavingId(null)
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.header}>
        <h1 className={s.title}>Замовлення</h1>
        <p className={s.subtitle}>Всього замовлень: {orders.length}</p>
      </div>

      <div className={s.toolbar}>
        <div className={s.searchContainer}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            placeholder="Пошук за номером, ім'ям або email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={s.searchInput}
          />
        </div>

        <div className={s.filterTabs}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`${s.filterTab} ${statusFilter === f.value ? s.filterTabActive : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={s.loading}>Завантаження...</div>
      ) : filteredOrders.length === 0 ? (
        <div className={s.emptyState}>
          <Package className={s.emptyIcon} />
          <h3 className={s.emptyTitle}>
            {searchTerm || statusFilter !== 'all'
              ? 'Замовлення не знайдено'
              : 'Немає замовлень'}
          </h3>
          <p className={s.emptyText}>
            {searchTerm || statusFilter !== 'all'
              ? 'Спробуйте змінити параметри пошуку'
              : "Замовлення з'являться тут після оформлення"}
          </p>
        </div>
      ) : (
        <div className={s.ordersList}>
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order._id
            const edit = getEdit(order)
            const currentStatus = edit.orderStatus ?? order.orderStatus
            const currentPayment = edit.paymentStatus ?? order.paymentStatus
            const currentTracking = edit.trackingNumber ?? order.trackingNumber ?? ''
            const dirty = hasChanges(order)

            return (
              <div key={order._id} className={s.orderCard}>
                <div className={s.orderHeader}>
                  <div>
                    <div className={s.orderNumberRow}>
                      <h3 className={s.orderNumber}>#{order.orderNumber}</h3>
                      <div
                        className={`${s.statusBadge} ${getStatusColor(order.orderStatus)}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        <span className={s.statusText}>{statusLabel(order.orderStatus)}</span>
                      </div>
                    </div>
                    <p className={s.detailText}>
                      Клієнт: {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                    </p>
                    <p className={s.detailText}>
                      Дата: {new Date(order.createdAt).toLocaleString('uk-UA')}
                    </p>
                  </div>
                  <div className={s.orderRight}>
                    <p className={s.orderPrice}>{formatPrice(order.total)}</p>
                    <p className={s.detailText}>{order.items.length} товар(ів)</p>
                  </div>
                </div>

                <div className={s.editGrid}>
                  <label className={s.field}>
                    <span className={s.fieldLabel}>Статус</span>
                    <select
                      className={s.select}
                      value={currentStatus}
                      onChange={(e) =>
                        setEditField(order._id, 'orderStatus', e.target.value as OrderStatus)
                      }
                    >
                      {ORDER_STATUSES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={s.field}>
                    <span className={s.fieldLabel}>Оплата</span>
                    <select
                      className={s.select}
                      value={currentPayment}
                      onChange={(e) =>
                        setEditField(order._id, 'paymentStatus', e.target.value as PaymentStatus)
                      }
                    >
                      {PAYMENT_STATUSES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={s.field}>
                    <span className={s.fieldLabel}>ТТН</span>
                    <input
                      type="text"
                      className={s.input}
                      value={currentTracking}
                      onChange={(e) => setEditField(order._id, 'trackingNumber', e.target.value)}
                      placeholder="Номер відстеження"
                    />
                  </label>

                  <label className={s.field}>
                    <span className={s.fieldLabel}>Коментар (зберігається в історії)</span>
                    <input
                      type="text"
                      className={s.input}
                      value={edit.note || ''}
                      onChange={(e) => setEditField(order._id, 'note', e.target.value)}
                      placeholder="Опціонально"
                    />
                  </label>

                  <button
                    onClick={() => saveChanges(order)}
                    disabled={!dirty || savingId === order._id}
                    className={s.saveBtn}
                  >
                    <Save className={s.saveIcon} />
                    {savingId === order._id ? 'Збереження...' : 'Зберегти'}
                  </button>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  className={s.expandBtn}
                >
                  {isExpanded ? <ChevronUp className={s.expandIcon} /> : <ChevronDown className={s.expandIcon} />}
                  {isExpanded ? 'Сховати деталі' : 'Показати деталі'}
                </button>

                {isExpanded && (
                  <div className={s.detailsBlock}>
                    <div className={s.detailsGrid}>
                      <div>
                        <h4 className={s.itemsTitle}>Адреса доставки</h4>
                        <p className={s.detailText}>
                          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </p>
                        {order.shippingAddress?.phone && (
                          <p className={s.detailText}>{order.shippingAddress.phone}</p>
                        )}
                        <p className={s.detailText}>
                          {order.shippingAddress?.street}, {order.shippingAddress?.city}
                          {order.shippingAddress?.zipCode ? `, ${order.shippingAddress.zipCode}` : ''}
                        </p>
                        {order.shippingAddress?.novaPoshtaWarehouse && (
                          <p className={s.detailText}>
                            Нова Пошта: {order.shippingAddress.novaPoshtaWarehouse}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className={s.itemsTitle}>Підсумок</h4>
                        <p className={s.detailText}>Товари: {formatPrice(order.subtotal)}</p>
                        <p className={s.detailText}>Доставка: {formatPrice(order.shippingCost)}</p>
                        {order.discount > 0 && (
                          <p className={s.detailText}>Знижка: −{formatPrice(order.discount)}</p>
                        )}
                        <p className={s.detailText}>Податок: {formatPrice(order.tax)}</p>
                        <p className={s.detailText}>
                          <strong>Всього: {formatPrice(order.total)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className={s.itemsSection}>
                      <h4 className={s.itemsTitle}>Товари:</h4>
                      <div className={s.itemsList}>
                        {order.items.map((item, index) => (
                          <div key={index} className={s.itemRow}>
                            <span>
                              {item.product?.name || item.name || 'Товар видалено'} × {item.quantity}
                            </span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
