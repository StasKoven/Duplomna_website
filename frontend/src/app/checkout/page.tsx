'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Truck, CreditCard, Wallet, ArrowLeft, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import CouponInput from '@/components/checkout/CouponInput'
import { toast } from 'sonner'
import s from './page.module.css'

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card'>('cash_on_delivery')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponCode, setCouponCode] = useState('')

  const [address, setAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ukraine',
  })

  // Prefill from user profile
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/checkout')
      return
    }
    if (user) {
      setAddress(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }))
    }
  }, [isAuthenticated, user, router])

  // If cart is empty — redirect back
  useEffect(() => {
    if (isAuthenticated && items.length === 0 && !orderPlaced) {
      router.replace('/cart')
    }
  }, [items, isAuthenticated, orderPlaced, router])

  const subtotal = getTotalPrice()
  const shippingCost = subtotal > 1000 ? 0 : 50
  const tax = Math.round(subtotal * 0.2)
  const total = subtotal + shippingCost + tax - couponDiscount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const required: (keyof ShippingAddress)[] = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'zipCode', 'country']
    for (const key of required) {
      if (!address[key]?.trim()) {
        toast.error(`Поле "${fieldLabel(key)}" обов'язкове`)
        return
      }
    }

    setIsSubmitting(true)
    try {
      const orderItems = items.map(item => {
        const product = item.product as Product
        return { product: product._id, quantity: item.quantity }
      })

      const response = await api.post('/orders', {
        items: orderItems,
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
      })

      await clearCart()
      setOrderId(response.data.order._id)
      setOrderPlaced(true)
      toast.success('Замовлення успішно оформлено!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка оформлення замовлення')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className={`container-custom ${s.successPage}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={s.successBox}
        >
          <div className={s.successIcon}>
            <CheckCircle className={s.checkIcon} />
          </div>
          <h1 className={s.successTitle}>Замовлення оформлено!</h1>
          <p className={s.successText}>
            Дякуємо за покупку! Ми надішлемо вам підтвердження на {address.email}.
            {orderId && (
              <><br /><span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground, #6b7280)' }}>Номер замовлення: #{orderId.slice(-8).toUpperCase()}</span></>
            )}
          </p>
          <div className={s.successActions}>
            <Link href="/orders" className="btn-primary">
              Мої замовлення
            </Link>
            <Link href="/products" className={s.continueLink}>
              Продовжити покупки
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.header}>
        <button onClick={() => router.back()} className={s.backBtn}>
          <ArrowLeft className={s.backIcon} />
          Назад до кошика
        </button>
        <h1 className={s.title}>Оформлення замовлення</h1>
      </div>

      <form onSubmit={handleSubmit} className={s.layout}>
        {/* ===== LEFT: form ===== */}
        <div className={s.formSection}>
          {/* Shipping */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <Truck className={s.cardIcon} />
              <h2 className={s.cardTitle}>Адреса доставки</h2>
            </div>

            <div className={s.formGrid}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Ім&apos;я *</label>
                <input
                  type="text"
                  name="firstName"
                  value={address.firstName}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="Ваше ім'я"
                  required
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Прізвище *</label>
                <input
                  type="text"
                  name="lastName"
                  value={address.lastName}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="Ваше прізвище"
                  required
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={address.email}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="+380XXXXXXXXX"
                  required
                />
              </div>
              <div className={`${s.fieldGroup} ${s.fullWidth}`}>
                <label className={s.label}>Вулиця, будинок, квартира *</label>
                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="вул. Хрещатик, 1, кв. 5"
                  required
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Місто *</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="Київ"
                  required
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Область</label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="Київська"
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Поштовий індекс *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={address.zipCode}
                  onChange={handleChange}
                  className={s.input}
                  placeholder="01001"
                  required
                />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Країна *</label>
                <select
                  name="country"
                  value={address.country}
                  onChange={handleChange}
                  className={s.input}
                  required
                >
                  <option value="Ukraine">Україна</option>
                  <option value="Poland">Польща</option>
                  <option value="Germany">Німеччина</option>
                  <option value="Other">Інша</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <CreditCard className={s.cardIcon} />
              <h2 className={s.cardTitle}>Спосіб оплати</h2>
            </div>

            <div className={s.paymentOptions}>
              <label className={`${s.paymentOption} ${paymentMethod === 'cash_on_delivery' ? s.paymentOptionActive : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className={s.radioInput}
                />
                <Wallet className={s.paymentIcon} />
                <div>
                  <span className={s.paymentTitle}>Оплата при отриманні</span>
                  <span className={s.paymentDesc}>Готівкою або карткою кур'єру</span>
                </div>
              </label>

              <label className={`${s.paymentOption} ${paymentMethod === 'card' ? s.paymentOptionActive : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className={s.radioInput}
                />
                <CreditCard className={s.paymentIcon} />
                <div>
                  <span className={s.paymentTitle}>Оплата карткою онлайн</span>
                  <span className={s.paymentDesc}>Visa, Mastercard</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: order summary ===== */}
        <div className={s.summarySection}>
          <div className={s.card}>
            <div className={s.cardHeader}>
              <ShoppingBag className={s.cardIcon} />
              <h2 className={s.cardTitle}>Ваше замовлення</h2>
            </div>

            <div className={s.itemsList}>
              {items.map((item, i) => {
                const product = item.product as Product
                const img = product.images?.[0]?.url
                return (
                  <div key={i} className={s.orderItem}>
                    {img ? (
                      <Image src={img} alt={product.name} width={56} height={56} className={s.itemImg} />
                    ) : (
                      <div className={s.itemImgPlaceholder} />
                    )}
                    <div className={s.itemInfo}>
                      <span className={s.itemName}>{product.name}</span>
                      <span className={s.itemQty}>× {item.quantity}</span>
                    </div>
                    <span className={s.itemPrice}>{formatPrice(product.price * item.quantity)}</span>
                  </div>
                )
              })}
            </div>

            <div className={s.divider} />

            {/* Coupon */}
            <CouponInput
              subtotal={subtotal}
              cart={items}
              onCouponApplied={(discount, code) => {
                setCouponDiscount(discount)
                setCouponCode(code)
              }}
              onCouponRemoved={() => {
                setCouponDiscount(0)
                setCouponCode('')
              }}
            />

            <div className={s.divider} />

            {/* Totals */}
            <div className={s.totals}>
              <div className={s.totalRow}>
                <span className={s.totalLabel}>Підсумок</span>
                <span className={s.totalValue}>{formatPrice(subtotal)}</span>
              </div>
              <div className={s.totalRow}>
                <span className={s.totalLabel}>
                  Доставка
                  {shippingCost === 0 && <span className={s.freeShipping}> (безкоштовно)</span>}
                </span>
                <span className={s.totalValue}>{shippingCost === 0 ? '0 ₴' : formatPrice(shippingCost)}</span>
              </div>
              <div className={s.totalRow}>
                <span className={s.totalLabel}>ПДВ (20%)</span>
                <span className={s.totalValue}>{formatPrice(tax)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className={s.totalRow}>
                  <span className={s.discountLabel}>Знижка ({couponCode})</span>
                  <span className={s.discountValue}>−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className={`${s.totalRow} ${s.grandTotal}`}>
                <span className={s.grandTotalLabel}>До сплати</span>
                <span className={s.grandTotalValue}>{formatPrice(Math.max(0, total))}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className={`btn-primary ${s.submitBtn}`}
            >
              {isSubmitting ? 'Оформлення...' : 'Оформити замовлення'}
            </button>

            <p className={s.secureNote}>
              🔒 Ваші дані захищені та зашифровані
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

// Helper labels for validation messages
function fieldLabel(key: string): string {
  const labels: Record<string, string> = {
    firstName: "Ім'я",
    lastName: 'Прізвище',
    email: 'Email',
    phone: 'Телефон',
    street: 'Вулиця',
    city: 'Місто',
    zipCode: 'Поштовий індекс',
    country: 'Країна',
  }
  return labels[key] || key
}
