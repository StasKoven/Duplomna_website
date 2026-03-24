'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import s from './page.module.css'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parent?: string
  createdAt: string
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/categories')
    } else if (user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchCategories()
    }
  }, [isAuthenticated, user, router])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/categories', { headers: { 'Cache-Control': 'no-cache' } })
      const incoming = response.data?.categories
      if (Array.isArray(incoming)) {
        setCategories(incoming)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Помилка завантаження категорій')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        icon: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      icon: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        // Update existing category
        await api.put(`/categories/${editingCategory._id}`, formData)
        toast.success('Категорію успішно оновлено')
      } else {
        // Create new category
        await api.post('/categories', formData)
        toast.success('Категорію успішно створено')
      }
      handleCloseModal()
      fetchCategories()
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Помилка ${editingCategory ? 'оновлення' : 'створення'} категорії`
      )
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити категорію "${name}"?`)) {
      return
    }

    try {
      await api.delete(`/categories/${id}`)
      toast.success('Категорію успішно видалено')
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Помилка видалення категорії')
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Категорії</h1>
          <p className={s.subtitle}>
            Всього категорій: {categories.length}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className={`btn-primary ${s.addButton}`}
        >
          <Plus className={s.buttonIcon} />
          Додати категорію
        </button>
      </div>

      {/* Search */}
      <div className={s.searchWrapper}>
        <div className={s.searchContainer}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            placeholder="Пошук категорій..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={s.loading}>Завантаження...</div>
      ) : (
        <div className={s.tableContainer}>
          <div className={s.tableScroll}>
            <table className={s.table}>
              <thead className={s.thead}>
                <tr>
                  <th className={s.th}>Назва</th>
                  <th className={s.th}>Slug</th>
                  <th className={s.th}>Іконка</th>
                  <th className={s.th}>Опис</th>
                  <th className={s.th}>Дата створення</th>
                  <th className={s.thRight}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category._id} className={s.tr}>
                    <td className={s.tdName}>{category.name}</td>
                    <td className={s.tdMuted}>
                      {category.slug}
                    </td>
                    <td className={s.tdIcon}>{category.icon || '-'}</td>
                    <td className={s.tdDescription}>
                      {category.description || '-'}
                    </td>
                    <td className={s.tdMuted}>
                      {new Date(category.createdAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td className={s.tdActions}>
                      <div className={s.actionsContainer}>
                        <button
                          onClick={() => handleOpenModal(category)}
                          className={s.actionButton}
                          title="Редагувати"
                        >
                          <Edit className={s.editIcon} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id, category.name)}
                          className={s.actionButton}
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

          {filteredCategories.length === 0 && (
            <div className={s.emptyState}>
              {searchTerm ? 'Категорій не знайдено' : 'Немає категорій'}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={s.overlay}>
          <div className={s.modal}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>
                {editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
              </h2>
              <button
                onClick={handleCloseModal}
                className={s.closeButton}
              >
                <X className={s.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>
              <div>
                <label className={s.label}>
                  Назва категорії *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`input ${s.formInput}`}
                  required
                />
              </div>

              <div>
                <label className={s.label}>Опис</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`input ${s.formInput}`}
                  rows={3}
                />
              </div>

              <div>
                <label className={s.label}>
                  Іконка (Lucide React)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className={`input ${s.formInput}`}
                  placeholder="Smartphone, Laptop, Headphones..."
                />
                <p className={s.hint}>
                  Назва іконки з бібліотеки Lucide React
                </p>
              </div>

              <div className={s.buttonRow}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`btn-secondary ${s.buttonHalf}`}
                >
                  Скасувати
                </button>
                <button type="submit" className={`btn-primary ${s.buttonHalf}`}>
                  {editingCategory ? 'Зберегти' : 'Створити'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
