'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Package, CheckCircle, XCircle, Clock, Truck, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import s from './page.module.css'

interface OrderItem {
  product: {
    _id: string
    name: string
    slug: string
    images: { url: string; alt?: string; isMain: boolean }[]
    price: number
  }
  name: string
  image?: string
  quantity: number
  price: number
  subtotal: number
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  total: number
  orderStatus: string
  paymentMethod: string
  shippingAddress: {
    firstName?: string
    lastName?: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders')
    } else {
      fetchOrders()
    }
  }, [isAuthenticated, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders/my-orders')
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const iconClass = `${s.statusIcon} ${
      status === 'delivered' ? s.iconDelivered
        : status === 'cancelled' ? s.iconCancelled
        : status === 'processing' ? s.iconProcessing
        : status === 'shipped' ? s.iconShipped
        : s.iconDefault
    }`
    switch (status) {
      case 'delivered':
        return <CheckCircle className={iconClass} />
      case 'cancelled':
        return <XCircle className={iconClass} />
      case 'processing':
        return <Clock className={iconClass} />
      case 'shipped':
        return <Truck className={iconClass} />
      default:
        return <Package className={iconClass} />
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Очікує'
      case 'processing':
        return 'Обробляється'
      case 'shipped':
        return 'Відправлено'
      case 'delivered':
        return 'Доставлено'
      case 'cancelled':
        return 'Скасовано'
      default:
        return status
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.header}>
        <h1 className={s.title}>Мої замовлення</h1>
        <p className={s.subtitle}>
          Історія ваших замовлень
        </p>
      </div>

      {loading ? (
        <div className={s.loading}>Завантаження...</div>
      ) : orders.length === 0 ? (
        <div className={s.emptyState}>
          <Package className={s.emptyIcon} />
          <h2 className={s.emptyTitle}>
            У вас поки немає замовлень
          </h2>
          <p className={s.emptyText}>
            Почніть робити покупки, щоб побачити свої замовлення тут
          </p>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary"
          >
            Переглянути товари
          </button>
        </div>
      ) : (
        <div className={s.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className={s.orderCard}>
              <div className={s.orderHeader}>
                <div>
                  <div className={s.orderNumberRow}>
                    <h3 className={s.orderNumber}>
                      Замовлення #{order.orderNumber}
                    </h3>
                  </div>
                  <p className={s.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className={s.statusWrapper}>
                  {getStatusIcon(order.orderStatus)}
                  <span
                    className={`${s.statusBadge} ${getStatusColor(order.orderStatus)}`}
                  >
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>
              </div>

              <div className={s.itemsSection}>
                <div className={s.itemsList}>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className={s.itemRow}
                    >
                      <div className={s.itemImageWrapper}>
                        {(item.image || item.product?.images?.[0]?.url) && (
                          <Image
                            src={item.image || item.product.images[0].url}
                            alt={item.name || item.product?.name || 'Товар'}
                            width={64}
                            height={64}
                            className={s.itemImage}
                          />
                        )}
                      </div>
                      <div className={s.itemInfo}>
                        <h4 className={s.itemName}>
                          {item.name || item.product?.name || 'Товар видалено'}
                        </h4>
                        <p className={s.itemQuantity}>
                          Кількість: {item.quantity}
                        </p>
                      </div>
                      <div className={s.itemPriceWrapper}>
                        <p className={s.itemPrice}>
                          {item.price.toLocaleString('uk-UA')} ₴
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={s.footerSection}>
                <div className={s.addressRow}>
                  <span className={s.addressLabel}>Адреса доставки:</span>
                  <span className={s.addressText}>
                    {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </span>
                </div>
                <div className={s.totalRow}>
                  <span className={s.totalLabel}>Всього:</span>
                  <span className={s.totalValue}>
                    {order.total.toLocaleString('uk-UA')} ₴
                  </span>
                </div>
                <Link
                  href={`/orders/${order._id}`}
                  className={s.detailsLink}
                >
                  <Eye className={s.detailsIcon} />
                  Деталі замовлення
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
