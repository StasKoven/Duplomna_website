'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Package, CheckCircle, XCircle, Clock, Truck } from 'lucide-react'

interface OrderItem {
  product: {
    _id: string
    name: string
    slug: string
    images: string[]
    price: number
  }
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  total: number
  status: string
  shippingAddress: {
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
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'shipped':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
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
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Мої замовлення</h1>
        <p className="text-muted-foreground">
          Історія ваших замовлень
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Завантаження...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            У вас поки немає замовлень
          </h2>
          <p className="text-muted-foreground mb-6">
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
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-card border rounded-lg p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      Замовлення #{order.orderNumber}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-muted rounded flex-shrink-0">
                        {item.product.images && item.product.images[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Кількість: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {item.price.toLocaleString('uk-UA')} ₴
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground">Адреса доставки:</span>
                  <span className="text-sm">
                    {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Всього:</span>
                  <span className="font-bold text-xl text-primary">
                    {order.total.toLocaleString('uk-UA')} ₴
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
