'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { Package, Clock, CheckCircle, XCircle, Search } from 'lucide-react'

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
  totalAmount: number
  status: string
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
      const response = await api.get('/orders')
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

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Замовлення</h1>
        <p className="text-muted-foreground">
          Всього замовлень: {orders.length}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Пошук за номером або email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Завантаження...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-lg">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Замовлення не знайдено' : 'Немає замовлень'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Спробуйте змінити параметри пошуку'
              : 'Замовлення з\'являться тут після оформлення'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      #{order.orderNumber}
                    </h3>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Клієнт: {order.user.firstName} {order.user.lastName} (
                    {order.user.email})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Дата: {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} товар(ів)
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Товари:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm"
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
