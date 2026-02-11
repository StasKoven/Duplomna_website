'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Plus, Edit, Trash2, Search, X, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface Coupon {
  _id: string
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
  isPublic: boolean
}

export default function AdminCouponsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    isPublic: true
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/coupons')
    } else if (user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchCoupons()
    }
  }, [isAuthenticated, user, router])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await api.get('/coupons')
      setCoupons(response.data.coupons || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Помилка завантаження купонів')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount || 0,
        usageLimit: coupon.usageLimit || 0,
        startDate: coupon.startDate.split('T')[0],
        endDate: coupon.endDate.split('T')[0],
        isActive: coupon.isActive,
        isPublic: coupon.isPublic
      })
    } else {
      setEditingCoupon(null)
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        code: '',
        description: '',
        type: 'percentage',
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        usageLimit: 0,
        startDate: today,
        endDate: today,
        isActive: true,
        isPublic: true
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCoupon(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, formData)
        toast.success('Купон успішно оновлено')
      } else {
        await api.post('/coupons', formData)
        toast.success('Купон успішно створено')
      }
      handleCloseModal()
      fetchCoupons()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Помилка ${editingCoupon ? 'оновлення' : 'створення'} купона`
      )
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити купон "${code}"?`)) {
      return
    }

    try {
      await api.delete(`/coupons/${id}`)
      toast.success('Купон успішно видалено')
      fetchCoupons()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка видалення купона')
    }
  }

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Купони та знижки</h1>
          <p className="text-muted-foreground">
            Всього купонів: {coupons.length}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Додати купон
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Пошук купонів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Завантаження...</div>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-3 px-4">Код</th>
                  <th className="text-left py-3 px-4">Опис</th>
                  <th className="text-left py-3 px-4">Тип</th>
                  <th className="text-left py-3 px-4">Значення</th>
                  <th className="text-left py-3 px-4">Використано</th>
                  <th className="text-left py-3 px-4">Період</th>
                  <th className="text-left py-3 px-4">Статус</th>
                  <th className="text-right py-3 px-4">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="border-t hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="font-mono font-bold">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {coupon.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {coupon.type === 'percentage' ? 'Відсоток' : 'Фіксована'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ₴`}
                    </td>
                    <td className="py-3 px-4">
                      {coupon.usageCount}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(coupon.startDate).toLocaleDateString('uk-UA')} - <br />
                      {new Date(coupon.endDate).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs text-center ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {coupon.isActive ? 'Активний' : 'Неактивний'}
                        </span>
                        {coupon.isPublic && (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 text-center">
                            Публічний
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(coupon)}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="Редагувати"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id, coupon.code)}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="Видалити"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? 'Купонів не знайдено' : 'Немає купонів'}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingCoupon ? 'Редагувати купон' : 'Новий купон'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Код купона *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="input w-full font-mono"
                    required
                    placeholder="SUMMER2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Тип знижки *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="input w-full"
                  >
                    <option value="percentage">Відсоток</option>
                    <option value="fixed">Фіксована сума</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Опис *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input w-full"
                  rows={2}
                  required
                  placeholder="Літня знижка 20%"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Значення *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: Number(e.target.value) })
                    }
                    className="input w-full"
                    required
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.type === 'percentage' ? 'Відсоток (%)' : 'Сума (₴)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Мін. сума покупки
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchase: Number(e.target.value) })
                    }
                    className="input w-full"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Макс. знижка
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                    }
                    className="input w-full"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Дата початку *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Дата закінчення *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ліміт використань (0 = необмежено)
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: Number(e.target.value) })
                  }
                  className="input w-full"
                  min="0"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="cursor-pointer"
                  />
                  <span className="text-sm">Активний</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className="cursor-pointer"
                  />
                  <span className="text-sm">Публічний</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                >
                  Скасувати
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingCoupon ? 'Зберегти' : 'Створити'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
