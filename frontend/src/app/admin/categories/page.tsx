'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import { toast } from 'sonner'

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
      } else if (response.status === 304) {
        console.log('Admin categories 304, keeping previous list')
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
    <div className="container-custom py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Категорії</h1>
          <p className="text-muted-foreground">
            Всього категорій: {categories.length}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Додати категорію
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Пошук категорій..."
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
                  <th className="text-left py-3 px-4">Назва</th>
                  <th className="text-left py-3 px-4">Slug</th>
                  <th className="text-left py-3 px-4">Іконка</th>
                  <th className="text-left py-3 px-4">Опис</th>
                  <th className="text-left py-3 px-4">Дата створення</th>
                  <th className="text-right py-3 px-4">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category._id} className="border-t hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{category.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {category.slug}
                    </td>
                    <td className="py-3 px-4 text-sm">{category.icon || '-'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                      {category.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(category.createdAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="Редагувати"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id, category.name)}
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

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? 'Категорій не знайдено' : 'Немає категорій'}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Назва категорії *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Опис</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input w-full"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Іконка (Lucide React)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="input w-full"
                  placeholder="Smartphone, Laptop, Headphones..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Назва іконки з бібліотеки Lucide React
                </p>
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
