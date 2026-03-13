'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'
import s from './page.module.css'

interface OrderItem {
  product: { _id: string; name: string; images: { url: string }[] }
  name: string
  image?: string
  quantity: number
  price: number
}

interface OrderData {
  _id: string
  orderNumber: string
  orderStatus: string
  items: OrderItem[]
  deliveredAt?: string
  updatedAt: string
}

const REASON_OPTIONS = [
  { value: 'defective', label: 'Дефект / несправність' },
  { value: 'wrong_item', label: 'Отримано не той товар' },
  { value: 'not_as_described', label: 'Не відповідає опису' },
  { value: 'changed_mind', label: 'Передумав(ла)' },
  { value: 'damaged_in_shipping', label: 'Пошкоджено при доставці' },
  { value: 'other', label: 'Інше' },
]

export default function ReturnRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [type, setType] = useState<'return' | 'exchange'>('return')
  const [selectedItems, setSelectedItems] = useState<Record<string, {
    selected: boolean
    reason: string
    quantity: number
  }>>({})
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchOrder()
  }, [isAuthenticated, orderId])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      const data = response.data.order as OrderData

      if (data.orderStatus !== 'delivered') {
        toast.error('Повернення можливе лише для доставлених замовлень')
        router.push(`/orders/${orderId}`)
        return
      }

      // Check 14-day window
      const deliveredAt = data.deliveredAt || data.updatedAt
      const daysSince = Math.floor(
        (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSince > 14) {
        toast.error('Термін повернення (14 днів) минув')
        router.push(`/orders/${orderId}`)
        return
      }

      setOrder(data)

      // Init selection state
      const initial: Record<string, { selected: boolean; reason: string; quantity: number }> = {}
      data.items.forEach(item => {
        const productId = typeof item.product === 'object' ? item.product._id : item.product
        initial[productId] = { selected: false, reason: 'defective', quantity: item.quantity }
      })
      setSelectedItems(initial)
    } catch {
      toast.error('Замовлення не знайдено')
      router.push('/orders')
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = (productId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: { ...prev[productId], selected: !prev[productId].selected }
    }))
  }

  const updateItemReason = (productId: string, reason: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: { ...prev[productId], reason }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const items = Object.entries(selectedItems)
      .filter(([, v]) => v.selected)
      .map(([productId, v]) => {
        const orderItem = order!.items.find(i =>
          (typeof i.product === 'object' ? i.product._id : i.product) === productId
        )
        return {
          product: productId,
          name: orderItem?.name || '',
          quantity: v.quantity,
          reason: v.reason
        }
      })

    if (items.length === 0) {
      toast.error('Оберіть хоча б один товар')
      return
    }

    if (!description.trim()) {
      toast.error('Опишіть причину повернення')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/returns', {
        orderId,
        items,
        type,
        description: description.trim()
      })

      toast.success('Заявку на повернення створено!')
      router.push(`/orders/${orderId}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка при створенні заявки')
    } finally {
      setSubmitting(false)
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

  if (!order) {
    return (
      <div className={`container-custom ${s.page}`}>
        <div className={s.errorState}>Замовлення не знайдено</div>
      </div>
    )
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <Link href={`/orders/${orderId}`} className={s.backLink}>
        <ArrowLeft className={s.backIcon} />
        Назад до замовлення
      </Link>

      <h1 className={s.title}>Повернення / Обмін</h1>
      <p className={s.subtitle}>Замовлення #{order.orderNumber}</p>

      <form onSubmit={handleSubmit} className={s.form}>
        {/* Тип заявки */}
        <div className={s.typeSection}>
          <h3 className={s.sectionTitle}>Тип заявки</h3>
          <div className={s.typeGrid}>
            <label
              className={`${s.typeOption} ${type === 'return' ? s.typeOptionActive : ''}`}
            >
              <input
                type="radio"
                name="type"
                value="return"
                checked={type === 'return'}
                onChange={() => setType('return')}
                className={s.typeRadio}
              />
              <div>
                <div className={s.typeLabel}>
                  <RotateCcw style={{ display: 'inline', width: 16, height: 16, marginRight: 6 }} />
                  Повернення
                </div>
                <div className={s.typeDesc}>Повернути товар і отримати кошти</div>
              </div>
            </label>
            <label
              className={`${s.typeOption} ${type === 'exchange' ? s.typeOptionActive : ''}`}
            >
              <input
                type="radio"
                name="type"
                value="exchange"
                checked={type === 'exchange'}
                onChange={() => setType('exchange')}
                className={s.typeRadio}
              />
              <div>
                <div className={s.typeLabel}>
                  <ArrowLeftRight style={{ display: 'inline', width: 16, height: 16, marginRight: 6 }} />
                  Обмін
                </div>
                <div className={s.typeDesc}>Обміняти на інший товар</div>
              </div>
            </label>
          </div>
        </div>

        {/* Товари */}
        <div className={s.itemsSection}>
          <h3 className={s.sectionTitle}>Оберіть товари</h3>
          <div className={s.itemsList}>
            {order.items.map((item) => {
              const productId = typeof item.product === 'object' ? item.product._id : String(item.product)
              const itemState = selectedItems[productId]
              const imgUrl = item.image || item.product?.images?.[0]?.url

              return (
                <div key={productId} className={s.itemCard}>
                  <input
                    type="checkbox"
                    checked={itemState?.selected || false}
                    onChange={() => toggleItem(productId)}
                    className={s.itemCheckbox}
                  />
                  {imgUrl && (
                    <div className={s.itemImage}>
                      <Image src={imgUrl} alt={item.name} width={48} height={48} className={s.itemImg} />
                    </div>
                  )}
                  <div className={s.itemDetails}>
                    <div className={s.itemName}>{item.name}</div>
                    <div className={s.itemMeta}>
                      Кількість: {item.quantity} | {item.price.toLocaleString('uk-UA')} ₴
                    </div>
                    {itemState?.selected && (
                      <select
                        value={itemState.reason}
                        onChange={(e) => updateItemReason(productId, e.target.value)}
                        className={s.reasonSelect}
                      >
                        {REASON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Опис */}
        <div className={s.descSection}>
          <h3 className={s.sectionTitle}>Опис проблеми</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Детально опишіть причину повернення або обміну..."
            rows={4}
            className={s.textarea}
            maxLength={1000}
          />
          <div className={s.charCount}>{description.length}/1000</div>
        </div>

        {/* Інфо */}
        <div className={s.infoBox}>
          <div className={s.infoTitle}>Умови повернення:</div>
          <ul className={s.infoList}>
            <li>Повернення можливе протягом 14 днів після отримання</li>
            <li>Товар має бути у оригінальній упаковці</li>
            <li>Зберігайте чек або квитанцію про оплату</li>
            <li>Обробка заявки займає 1-3 робочих дні</li>
          </ul>
        </div>

        {/* Кнопки */}
        <div className={s.actions}>
          <button
            type="submit"
            disabled={submitting}
            className={s.submitBtn}
          >
            {submitting ? 'Відправляємо...' : 'Надіслати заявку'}
          </button>
          <Link href={`/orders/${orderId}`} className={s.cancelBtn}>
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  )
}
