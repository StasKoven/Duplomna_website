'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  RotateCcw,
} from 'lucide-react'
import s from './page.module.css'

interface StatusHistoryItem {
  status: string
  date: string
  note?: string
}

interface OrderDetail {
  _id: string
  orderNumber: string
  items: {
    product: { _id: string; name: string; slug: string; images: { url: string }[] }
    name: string
    image?: string
    quantity: number
    price: number
    subtotal: number
  }[]
  shippingAddress: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    street: string
    city: string
    state?: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  statusHistory: StatusHistoryItem[]
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
  trackingNumber?: string
  deliveredAt?: string
  cancelledAt?: string
  cancellationReason?: string
  notes?: string
  createdAt: string
}

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered']

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  pending: { label: 'Оформлено', icon: Clock },
  processing: { label: 'Обробляється', icon: Package },
  shipped: { label: 'Відправлено', icon: Truck },
  delivered: { label: 'Доставлено', icon: CheckCircle },
  cancelled: { label: 'Скасовано', icon: XCircle },
}

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Банківська картка',
  paypal: 'PayPal',
  cash_on_delivery: 'Оплата при отриманні',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Очікує оплати',
  paid: 'Оплачено',
  failed: 'Помилка оплати',
  refunded: 'Повернено',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const orderId = params.id as string

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders')
      return
    }
    fetchOrder()
  }, [isAuthenticated, orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/orders/${orderId}`)
      setOrder(response.data.order)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className={`container-custom ${s.page}`}>
        <div className={s.loading}>Завантаження...</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className={`container-custom ${s.page}`}>
        <div className={s.errorState}>
          <h2 className={s.errorTitle}>Замовлення не знайдено</h2>
          <p className={s.errorText}>Перевірте правильність посилання</p>
          <Link href="/orders" className="btn-primary">
            Повернутися до замовлень
          </Link>
        </div>
      </div>
    )
  }

  const isCancelled = order.orderStatus === 'cancelled'
  const currentStatusIndex = ALL_STATUSES.indexOf(order.orderStatus)

  // Build timeline steps
  const getHistoryDate = (status: string): string | undefined => {
    const entry = [...order.statusHistory].reverse().find((h) => h.status === status)
    return entry?.date
  }

  const getHistoryNote = (status: string): string | undefined => {
    const entry = [...order.statusHistory].reverse().find((h) => h.status === status)
    return entry?.note
  }

  const timelineSteps = isCancelled
    ? [
        ...ALL_STATUSES
          .filter((st) => {
            const idx = ALL_STATUSES.indexOf(st)
            return idx <= currentStatusIndex || getHistoryDate(st)
          })
          .map((st) => ({ status: st, state: 'completed' as const })),
        { status: 'cancelled', state: 'cancelled' as const },
      ]
    : ALL_STATUSES.map((st, idx) => ({
        status: st,
        state:
          idx < currentStatusIndex
            ? ('completed' as const)
            : idx === currentStatusIndex
            ? ('current' as const)
            : ('upcoming' as const),
      }))

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered': return s.statusDelivered
      case 'cancelled': return s.statusCancelled
      case 'processing': return s.statusProcessing
      case 'shipped': return s.statusShipped
      default: return s.statusDefault
    }
  }

  const getDotClass = (state: string) => {
    switch (state) {
      case 'completed': return s.dotCompleted
      case 'current': return s.dotCurrent
      case 'cancelled': return s.dotCancelled
      default: return s.dotUpcoming
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`container-custom ${s.page}`}>
      {/* Назад */}
      <Link href="/orders" className={s.backLink}>
        <ArrowLeft className={s.backIcon} />
        Назад до замовлень
      </Link>

      {/* Заголовок */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.title}>Замовлення #{order.orderNumber}</h1>
          <p className={s.orderDate}>{formatDate(order.createdAt)}</p>
        </div>
        <span className={`${s.statusBadge} ${getStatusBadgeClass(order.orderStatus)}`}>
          {STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
        </span>
        {order.orderStatus === 'delivered' && (() => {
          const deliveredAt = order.deliveredAt || order.createdAt
          const daysSince = Math.floor(
            (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
          )
          return daysSince <= 14 ? (
            <Link
              href={`/orders/${order._id}/return`}
              className={s.statusBadge}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: 'var(--color-muted)', color: 'var(--color-foreground)' }}
            >
              <RotateCcw style={{ width: 14, height: 14 }} />
              Повернення / Обмін
            </Link>
          ) : null
        })()}
      </div>

      {/* Таймлайн трекінгу */}
      <div className={s.timelineSection}>
        <h2 className={s.timelineTitle}>Відстеження замовлення</h2>
        <div className={s.timeline}>
          <div className={s.timelineLine} />
          {timelineSteps.map((step, idx) => {
            const config = STATUS_CONFIG[step.status]
            const Icon = config?.icon || Package
            const date = getHistoryDate(step.status)
            const note = getHistoryNote(step.status)

            return (
              <div key={idx} className={s.timelineItem}>
                <div className={`${s.timelineDot} ${getDotClass(step.state)}`}>
                  <Icon className={s.timelineDotIcon} />
                </div>
                <div className={s.timelineContent}>
                  <div className={s.timelineLabel}>{config?.label}</div>
                  {date && (
                    <div className={s.timelineDate}>{formatDate(date)}</div>
                  )}
                  {note && (
                    <div className={s.timelineNote}>{note}</div>
                  )}
                  {step.status === 'shipped' && order.trackingNumber && (
                    <div className={s.trackingNumber}>
                      <span className={s.trackingLabel}>Трек-номер: </span>
                      <span className={s.trackingValue}>{order.trackingNumber}</span>
                    </div>
                  )}
                  {step.status === 'cancelled' && order.cancellationReason && (
                    <div className={s.timelineNote}>
                      Причина: {order.cancellationReason}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Інформація */}
      <div className={s.infoGrid}>
        {/* Адреса доставки */}
        <div className={s.infoCard}>
          <h3 className={s.infoTitle}>
            <MapPin style={{ display: 'inline', width: 18, height: 18, marginRight: 8 }} />
            Адреса доставки
          </h3>
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Отримувач</span>
            <span className={s.infoValue}>
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </span>
          </div>
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Адреса</span>
            <span className={s.infoValue}>{order.shippingAddress.street}</span>
          </div>
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Місто</span>
            <span className={s.infoValue}>
              {order.shippingAddress.city}, {order.shippingAddress.zipCode}
            </span>
          </div>
          {order.shippingAddress.phone && (
            <div className={s.infoRow}>
              <span className={s.infoLabel}>Телефон</span>
              <span className={s.infoValue}>{order.shippingAddress.phone}</span>
            </div>
          )}
        </div>

        {/* Оплата */}
        <div className={s.infoCard}>
          <h3 className={s.infoTitle}>
            <CreditCard style={{ display: 'inline', width: 18, height: 18, marginRight: 8 }} />
            Оплата
          </h3>
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Спосіб оплати</span>
            <span className={s.infoValue}>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
          </div>
          <div className={s.infoRow}>
            <span className={s.infoLabel}>Статус оплати</span>
            <span className={s.infoValue}>{PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Товари */}
      <div className={s.itemsSection}>
        <h3 className={s.itemsTitle}>Товари ({order.items.length})</h3>
        <div className={s.itemsList}>
          {order.items.map((item, index) => (
            <div key={index} className={s.itemRow}>
              <div className={s.itemImage}>
                {(item.image || item.product?.images?.[0]?.url) && (
                  <Image
                    src={item.image || item.product.images[0].url}
                    alt={item.name}
                    width={64}
                    height={64}
                    className={s.itemImg}
                  />
                )}
              </div>
              <div className={s.itemInfo}>
                <div className={s.itemName}>{item.name}</div>
                <div className={s.itemQuantity}>
                  {item.quantity} × {item.price.toLocaleString('uk-UA')} ₴
                </div>
              </div>
              <div className={s.itemPrice}>
                {item.subtotal.toLocaleString('uk-UA')} ₴
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Підсумок */}
      <div className={s.summarySection}>
        <h3 className={s.summaryTitle}>Підсумок замовлення</h3>
        <div className={s.summaryRow}>
          <span className={s.summaryLabel}>Підсумок товарів</span>
          <span className={s.summaryValue}>{order.subtotal.toLocaleString('uk-UA')} ₴</span>
        </div>
        <div className={s.summaryRow}>
          <span className={s.summaryLabel}>Доставка</span>
          <span className={s.summaryValue}>
            {order.shippingCost === 0 ? 'Безкоштовно' : `${order.shippingCost.toLocaleString('uk-UA')} ₴`}
          </span>
        </div>
        <div className={s.summaryRow}>
          <span className={s.summaryLabel}>Податок</span>
          <span className={s.summaryValue}>{order.tax.toLocaleString('uk-UA')} ₴</span>
        </div>
        {order.discount > 0 && (
          <div className={s.summaryRow}>
            <span className={s.summaryLabel}>Знижка</span>
            <span className={`${s.summaryValue} ${s.discountValue}`}>
              -{order.discount.toLocaleString('uk-UA')} ₴
            </span>
          </div>
        )}
        <div className={s.summaryTotal}>
          <span className={s.summaryTotalLabel}>Всього</span>
          <span className={s.summaryTotalValue}>{order.total.toLocaleString('uk-UA')} ₴</span>
        </div>
      </div>
    </div>
  )
}
