'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Truck, CreditCard, Wallet, ArrowLeft, CheckCircle, MapPin } from 'lucide-react'
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

interface NovaPoshtaCity {
  ref: string
  name: string
  mainDescription: string
  area: string
}

interface NovaPoshtaWarehouse {
  ref: string
  number: string
  description: string
  shortAddress: string
}

/* ─── Floating dropdown rendered via portal ─── */
function FloatingDropdown({
  anchorRef,
  open,
  children,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>
  open: boolean
  children: React.ReactNode
}) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (!open || !anchorRef.current) return
    const update = () => {
      const r = anchorRef.current!.getBoundingClientRect()
      setPos({ top: r.bottom, left: r.left, width: r.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, anchorRef])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 99999,
        background: 'hsl(var(--background, 0 0% 100%))',
        border: '1px solid hsl(var(--border, 220 13% 91%))',
        borderRadius: '0.5rem',
        maxHeight: '240px',
        overflowY: 'auto',
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>,
    document.body,
  )
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

  const [deliveryMethod, setDeliveryMethod] = useState<'nova_poshta' | 'courier'>('nova_poshta')

  // Nova Poshta state
  const [citySearch, setCitySearch] = useState('')
  const [cities, setCities] = useState<NovaPoshtaCity[]>([])
  const [selectedCity, setSelectedCity] = useState<NovaPoshtaCity | null>(null)
  const [warehouses, setWarehouses] = useState<NovaPoshtaWarehouse[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<NovaPoshtaWarehouse | null>(null)
  const [warehouseSearch, setWarehouseSearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)

  const cityFieldRef = useRef<HTMLDivElement>(null)
  const warehouseFieldRef = useRef<HTMLDivElement>(null)

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

  // If cart is empty — redirect back (but NOT while we are placing the order)
  useEffect(() => {
    if (isAuthenticated && items.length === 0 && !orderPlaced && !isSubmitting) {
      router.replace('/cart')
    }
  }, [items, isAuthenticated, orderPlaced, isSubmitting, router])

  // Search cities with debounce
  useEffect(() => {
    if (deliveryMethod !== 'nova_poshta' || citySearch.length < 2) {
      setCities([])
      return
    }

    const timer = setTimeout(async () => {
      setLoadingCities(true)
      try {
        const { data } = await api.get(`/novaposhta/cities?q=${encodeURIComponent(citySearch)}`)
        setCities(data.cities || [])
        setShowCityDropdown(true)
      } catch {
        setCities([])
      } finally {
        setLoadingCities(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [citySearch, deliveryMethod])

  // Fetch warehouses when city is selected
  useEffect(() => {
    if (!selectedCity) {
      setWarehouses([])
      return
    }

    const fetchWarehouses = async () => {
      setLoadingWarehouses(true)
      try {
        const params = new URLSearchParams({ cityRef: selectedCity.ref })
        if (warehouseSearch) params.set('q', warehouseSearch)
        const { data } = await api.get(`/novaposhta/warehouses?${params}`)
        setWarehouses(data.warehouses || [])
        setShowWarehouseDropdown(true)
      } catch {
        setWarehouses([])
      } finally {
        setLoadingWarehouses(false)
      }
    }

    const timer = setTimeout(fetchWarehouses, 300)
    return () => clearTimeout(timer)
  }, [selectedCity, warehouseSearch])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = () => {
      setShowCityDropdown(false)
      setShowWarehouseDropdown(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

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
    const required: (keyof ShippingAddress)[] = ['firstName', 'lastName', 'email', 'phone']
    if (deliveryMethod === 'courier') {
      required.push('street', 'city', 'zipCode', 'country')
    }
    for (const key of required) {
      if (!address[key]?.trim()) {
        toast.error(`Поле "${fieldLabel(key)}" обов'язкове`)
        return
      }
    }

    // Phone format: must contain 10-15 digits
    const digitsOnly = address.phone.replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      toast.error('Введіть коректний номер телефону (+380XXXXXXXXX)')
      return
    }

    if (deliveryMethod === 'nova_poshta') {
      if (!selectedCity) {
        toast.error('Оберіть місто доставки')
        return
      }
      if (!selectedWarehouse) {
        toast.error('Оберіть відділення Нової Пошти')
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
        shippingAddress: {
          ...address,
          city: selectedCity?.mainDescription || address.city,
          novaPoshtaCityRef: selectedCity?.ref || '',
          novaPoshtaWarehouseRef: selectedWarehouse?.ref || '',
          novaPoshtaWarehouse: selectedWarehouse?.description || '',
          deliveryMethod,
          street: deliveryMethod === 'nova_poshta' ? (selectedWarehouse?.description || address.street) : address.street,
        },
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
          {/* Delivery Method */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <Truck className={s.cardIcon} />
              <h2 className={s.cardTitle}>Доставка</h2>
            </div>

            {/* Delivery method toggle */}
            <div className={s.paymentOptions} style={{ marginBottom: '1.25rem' }}>
              <label className={`${s.paymentOption} ${deliveryMethod === 'nova_poshta' ? s.paymentOptionActive : ''}`}>
                <input type="radio" name="delivery" value="nova_poshta" checked={deliveryMethod === 'nova_poshta'} onChange={() => setDeliveryMethod('nova_poshta')} className={s.radioInput} />
                <MapPin className={s.paymentIcon} />
                <div>
                  <span className={s.paymentTitle}>Нова Пошта</span>
                  <span className={s.paymentDesc}>Доставка у відділення</span>
                </div>
              </label>
              <label className={`${s.paymentOption} ${deliveryMethod === 'courier' ? s.paymentOptionActive : ''}`}>
                <input type="radio" name="delivery" value="courier" checked={deliveryMethod === 'courier'} onChange={() => setDeliveryMethod('courier')} className={s.radioInput} />
                <Truck className={s.paymentIcon} />
                <div>
                  <span className={s.paymentTitle}>Кур&apos;єрська доставка</span>
                  <span className={s.paymentDesc}>За вказаною адресою</span>
                </div>
              </label>
            </div>

            <div className={s.formGrid}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Ім&apos;я *</label>
                <input type="text" name="firstName" value={address.firstName} onChange={handleChange} className={s.input} placeholder="Ваше ім'я" required />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Прізвище *</label>
                <input type="text" name="lastName" value={address.lastName} onChange={handleChange} className={s.input} placeholder="Ваше прізвище" required />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Email *</label>
                <input type="email" name="email" value={address.email} onChange={handleChange} className={s.input} placeholder="your@email.com" required />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Телефон *</label>
                <input type="tel" name="phone" value={address.phone} onChange={handleChange} className={s.input} placeholder="+380XXXXXXXXX" required />
              </div>

              {deliveryMethod === 'nova_poshta' ? (
                <>
                  {/* City search */}
                  <div ref={cityFieldRef} className={`${s.fieldGroup} ${s.fullWidth}`} onClick={(e) => e.stopPropagation()}>
                    <label className={s.label}>Місто *</label>
                    <input
                      type="text"
                      value={selectedCity ? selectedCity.mainDescription : citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value)
                        setSelectedCity(null)
                        setSelectedWarehouse(null)
                        setWarehouses([])
                      }}
                      onFocus={() => cities.length > 0 && setShowCityDropdown(true)}
                      className={s.input}
                      placeholder="Почніть вводити назву міста..."
                      required
                    />
                    {loadingCities && <div className={s.fieldHint}>Пошук...</div>}
                  </div>
                  <FloatingDropdown anchorRef={cityFieldRef} open={showCityDropdown && cities.length > 0}>
                    {cities.map(city => (
                      <button
                        key={city.ref}
                        type="button"
                        className={s.dropdownItem}
                        onClick={() => {
                          setSelectedCity(city)
                          setCitySearch('')
                          setShowCityDropdown(false)
                          setSelectedWarehouse(null)
                          setWarehouseSearch('')
                          setAddress(prev => ({ ...prev, city: city.mainDescription }))
                        }}
                      >
                        {city.name}
                      </button>
                    ))}
                  </FloatingDropdown>

                  {/* Warehouse search */}
                  {selectedCity && (
                    <>
                      <div ref={warehouseFieldRef} className={`${s.fieldGroup} ${s.fullWidth}`} onClick={(e) => e.stopPropagation()}>
                        <label className={s.label}>Відділення Нової Пошти *</label>
                        <input
                          type="text"
                          value={selectedWarehouse ? selectedWarehouse.description : warehouseSearch}
                          onChange={(e) => {
                            setWarehouseSearch(e.target.value)
                            setSelectedWarehouse(null)
                          }}
                          onFocus={() => warehouses.length > 0 && setShowWarehouseDropdown(true)}
                          className={s.input}
                          placeholder="Пошук відділення за номером або адресою..."
                          required
                        />
                        {loadingWarehouses && <div className={s.fieldHint}>Завантаження...</div>}
                      </div>
                      <FloatingDropdown anchorRef={warehouseFieldRef} open={showWarehouseDropdown && warehouses.length > 0}>
                        {warehouses.map(wh => (
                          <button
                            key={wh.ref}
                            type="button"
                            className={s.dropdownItem}
                            onClick={() => {
                              setSelectedWarehouse(wh)
                              setShowWarehouseDropdown(false)
                              setWarehouseSearch('')
                              setAddress(prev => ({ ...prev, street: wh.description, zipCode: wh.number }))
                            }}
                          >
                            <div style={{ fontWeight: 500 }}>{wh.description}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{wh.shortAddress}</div>
                          </button>
                        ))}
                      </FloatingDropdown>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className={`${s.fieldGroup} ${s.fullWidth}`}>
                    <label className={s.label}>Вулиця, будинок, квартира *</label>
                    <input type="text" name="street" value={address.street} onChange={handleChange} className={s.input} placeholder="вул. Хрещатик, 1, кв. 5" required />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Місто *</label>
                    <input type="text" name="city" value={address.city} onChange={handleChange} className={s.input} placeholder="Київ" required />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Область</label>
                    <input type="text" name="state" value={address.state} onChange={handleChange} className={s.input} placeholder="Київська" />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Поштовий індекс *</label>
                    <input type="text" name="zipCode" value={address.zipCode} onChange={handleChange} className={s.input} placeholder="01001" required />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Країна *</label>
                    <select name="country" value={address.country} onChange={handleChange} className={s.input} required>
                      <option value="Ukraine">Україна</option>
                      <option value="Poland">Польща</option>
                      <option value="Germany">Німеччина</option>
                      <option value="Other">Інша</option>
                    </select>
                  </div>
                </>
              )}
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
                  <span className={s.paymentDesc}>Visa, Mastercard &mdash; замовлення буде відправлено після підтвердження</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: order summary ===== */}
        <div className={s.summarySection}>
          <div className={`${s.card} ${s.summaryCard}`}>
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
