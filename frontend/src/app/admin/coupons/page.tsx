'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Plus, Edit, Trash2, Search, X, Tag } from 'lucide-react'
import { toast } from 'sonner'
import s from './page.module.css'

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
    <div className={`container-custom ${s.page}`}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Купони та знижки</h1>
          <p className={s.subtitle}>
            Всього купонів: {coupons.length}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className={`btn-primary ${s.addButton}`}
        >
          <Plus className={s.addIcon} />
          Додати купон
        </button>
      </div>

      {/* Search */}
      <div className={s.searchSection}>
        <div className={s.searchWrapper}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            placeholder="Пошук купонів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={s.loadingState}>Завантаження...</div>
      ) : (
        <div className={s.tableCard}>
          <div className={s.tableScroll}>
            <table className={s.table}>
              <thead className={s.tableHead}>
                <tr>
                  <th className={s.th}>Код</th>
                  <th className={s.th}>Опис</th>
                  <th className={s.th}>Тип</th>
                  <th className={s.th}>Значення</th>
                  <th className={s.th}>Використано</th>
                  <th className={s.th}>Період</th>
                  <th className={s.th}>Статус</th>
                  <th className={s.thRight}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className={s.row}>
                    <td className={s.cell}>
                      <div className={s.codeCell}>
                        <Tag className={s.tagIcon} />
                        <span className={s.codeText}>{coupon.code}</span>
                      </div>
                    </td>
                    <td className={s.descCell}>
                      {coupon.description}
                    </td>
                    <td className={s.cell}>
                      <span className={s.typeText}>
                        {coupon.type === 'percentage' ? 'Відсоток' : 'Фіксована'}
                      </span>
                    </td>
                    <td className={s.valueCell}>
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ₴`}
                    </td>
                    <td className={s.cell}>
                      {coupon.usageCount}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </td>
                    <td className={s.dateCell}>
                      {new Date(coupon.startDate).toLocaleDateString('uk-UA')} - <br />
                      {new Date(coupon.endDate).toLocaleDateString('uk-UA')}
                    </td>
                    <td className={s.cell}>
                      <div className={s.statusCell}>
                        <span
                          className={coupon.isActive ? s.statusBadgeActive : s.statusBadgeInactive}
                        >
                          {coupon.isActive ? 'Активний' : 'Неактивний'}
                        </span>
                        {coupon.isPublic && (
                          <span className={s.publicBadge}>
                            Публічний
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={s.actionsCell}>
                      <div className={s.actionsRow}>
                        <button
                          onClick={() => handleOpenModal(coupon)}
                          className={s.actionBtn}
                          title="Редагувати"
                        >
                          <Edit className={s.editIcon} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id, coupon.code)}
                          className={s.actionBtn}
                          title="Видалити"
                        >
                          <Trash2 className={s.deleteIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoupons.length === 0 && (
            <div className={s.emptyState}>
              {searchTerm ? 'Купонів не знайдено' : 'Немає купонів'}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={s.modalOverlay}>
          <div className={s.modalContent}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {editingCoupon ? 'Редагувати купон' : 'Новий купон'}
              </h2>
              <button
                onClick={handleCloseModal}
                className={s.modalCloseBtn}
              >
                <X className={s.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>
              <div className={s.formGrid2}>
                <div>
                  <label className={s.formLabel}>
                    Код купона *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className={`input ${s.formInputMono}`}
                    required
                    placeholder="SUMMER2024"
                  />
                </div>

                <div>
                  <label className={s.formLabel}>
                    Тип знижки *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className={`input ${s.formInputFull}`}
                  >
                    <option value="percentage">Відсоток</option>
                    <option value="fixed">Фіксована сума</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={s.formLabel}>Опис *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`input ${s.formInputFull}`}
                  rows={2}
                  required
                  placeholder="Літня знижка 20%"
                />
              </div>

              <div className={s.formGrid3}>
                <div>
                  <label className={s.formLabel}>
                    Значення *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: Number(e.target.value) })
                    }
                    className={`input ${s.formInputFull}`}
                    required
                    min="0"
                    step="0.01"
                  />
                  <p className={s.formHint}>
                    {formData.type === 'percentage' ? 'Відсоток (%)' : 'Сума (₴)'}
                  </p>
                </div>

                <div>
                  <label className={s.formLabel}>
                    Мін. сума покупки
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchase: Number(e.target.value) })
                    }
                    className={`input ${s.formInputFull}`}
                    min="0"
                  />
                </div>

                <div>
                  <label className={s.formLabel}>
                    Макс. знижка
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                    }
                    className={`input ${s.formInputFull}`}
                    min="0"
                  />
                </div>
              </div>

              <div className={s.formGrid2}>
                <div>
                  <label className={s.formLabel}>
                    Дата початку *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className={`input ${s.formInputFull}`}
                    required
                  />
                </div>

                <div>
                  <label className={s.formLabel}>
                    Дата закінчення *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className={`input ${s.formInputFull}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={s.formLabel}>
                  Ліміт використань (0 = необмежено)
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: Number(e.target.value) })
                  }
                  className={`input ${s.formInputFull}`}
                  min="0"
                />
              </div>

              <div className={s.checkboxRow}>
                <label className={s.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className={s.checkboxInput}
                  />
                  <span className={s.checkboxText}>Активний</span>
                </label>

                <label className={s.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className={s.checkboxInput}
                  />
                  <span className={s.checkboxText}>Публічний</span>
                </label>
              </div>

              <div className={s.formActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`btn-secondary ${s.formActionBtn}`}
                >
                  Скасувати
                </button>
                <button type="submit" className={`btn-primary ${s.formActionBtn}`}>
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
