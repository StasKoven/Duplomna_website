'use client'

import { useState } from 'react'
import { Tag, X, Check } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import s from './CouponInput.module.css'

interface CouponInputProps {
  subtotal: number
  cart: any[]
  onCouponApplied: (discount: number, couponCode: string) => void
  onCouponRemoved: () => void
}

export default function CouponInput({
  subtotal,
  cart,
  onCouponApplied,
  onCouponRemoved
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      toast.error('Введіть код купона')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/coupons/validate', {
        code: code.trim(),
        subtotal,
        cart
      })

      const { coupon } = response.data
      setAppliedCoupon(coupon)
      onCouponApplied(coupon.discount, coupon.code)
      toast.success(`Купон застосовано! Знижка: ${coupon.discount} ₴`)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Невірний або недійсний купон'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCode('')
    onCouponRemoved()
    toast.info('Купон видалено')
  }

  if (appliedCoupon) {
    return (
      <div className={s.appliedContainer}>
        <div className={s.appliedContent}>
          <div className={s.appliedInner}>
            <div className={s.iconContainer}>
              <Check className={s.checkIcon} />
            </div>
            <div className={s.contentArea}>
              <div className={s.titleRow}>
                <span className={s.titleText}>
                  Купон застосовано
                </span>
                <span className={s.codeBadge}>
                  {appliedCoupon.code}
                </span>
              </div>
              <p className={s.description}>
                {appliedCoupon.description}
              </p>
              <div className={s.discountRow}>
                <span className={s.discountLabel}>Знижка:</span>
                <span className={s.discountValue}>
                  -{appliedCoupon.discount.toLocaleString('uk-UA')} ₴
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className={s.removeButton}
            title="Видалити купон"
          >
            <X className={s.removeIcon} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={s.inputContainer}>
      <div className={s.headerRow}>
        <Tag className={s.tagIcon} />
        <h3 className={s.title}>Є промокод?</h3>
      </div>
      
      <div className={s.inputRow}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Введіть код купона"
          className={`input ${s.input}`}
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleApplyCoupon()
            }
          }}
        />
        <button
          onClick={handleApplyCoupon}
          disabled={loading || !code.trim()}
          className={`btn-primary ${s.applyButton}`}
        >
          {loading ? 'Перевірка...' : 'Застосувати'}
        </button>
      </div>
      
      <p className={s.helpText}>
        Введіть промокод, щоб отримати знижку
      </p>
    </div>
  )
}
