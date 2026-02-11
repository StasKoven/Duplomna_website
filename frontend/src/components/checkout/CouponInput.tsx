'use client'

import { useState } from 'react'
import { Tag, X, Check } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-green-900">
                  Купон застосовано
                </span>
                <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-mono rounded">
                  {appliedCoupon.code}
                </span>
              </div>
              <p className="text-sm text-green-700 mb-2">
                {appliedCoupon.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-green-600">Знижка:</span>
                <span className="text-lg font-bold text-green-700">
                  -{appliedCoupon.discount.toLocaleString('uk-UA')} ₴
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="p-2 hover:bg-green-100 rounded-md transition-colors"
            title="Видалити купон"
          >
            <X className="h-4 w-4 text-green-600" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Є промокод?</h3>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Введіть код купона"
          className="input flex-1 font-mono"
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
          className="btn-primary whitespace-nowrap disabled:opacity-50"
        >
          {loading ? 'Перевірка...' : 'Застосувати'}
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Введіть промокод, щоб отримати знижку
      </p>
    </div>
  )
}
