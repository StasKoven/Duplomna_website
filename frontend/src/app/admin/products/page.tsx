'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import s from './page.module.css'

export default function AdminProductsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/products')
    } else if (user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchProducts()
    }
  }, [isAuthenticated, user, router])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products', {
        params: { limit: 100 },
      })
      setProducts(response.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Помилка завантаження товарів')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) return

    try {
      await api.delete(`/products/${id}`)
      toast.success('Товар видалено')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Помилка видалення товару')
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.title}>Керування товарами</h1>
          <p className={s.subtitle}>
            Всього товарів: {products.length}
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className={s.addBtn}
        >
          <Plus className={s.addBtnIcon} />
          Додати товар
        </Link>
      </div>

      {/* Search */}
      <div className={s.searchSection}>
        <div className={s.searchWrap}>
          <Search className={s.searchIcon} />
          <input
            type="text"
            placeholder="Пошук товарів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={s.loading}>Завантаження...</div>
      ) : (
        <div className={s.tableCard}>
          <div className={s.tableScroll}>
            <table className={s.table}>
              <thead className={s.thead}>
                <tr>
                  <th className={s.th}>Зображення</th>
                  <th className={s.th}>Назва</th>
                  <th className={s.th}>Ціна</th>
                  <th className={s.th}>Запас</th>
                  <th className={s.th}>Статус</th>
                  <th className={s.thActions}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className={s.tr}>
                    <td className={s.td}>
                      <div className={s.imageWrap}>
                        {product.images[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className={s.image}
                          />
                        ) : (
                          <div className={s.imagePlaceholder}>
                            📱
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={s.td}>
                      <div>
                        <div className={s.productName}>
                          {product.name}
                        </div>
                        <div className={s.productSlug}>
                          {product.slug}
                        </div>
                      </div>
                    </td>
                    <td className={s.td}>
                      <div className={s.price}>{formatPrice(product.price)}</div>
                      {product.comparePrice && (
                        <div className={s.comparePrice}>
                          {formatPrice(product.comparePrice)}
                        </div>
                      )}
                    </td>
                    <td className={s.td}>
                      <span
                        className={`${s.badge} ${
                          product.stock === 0
                            ? s.stockNone
                            : product.stock < 5
                            ? s.stockLow
                            : s.stockOk
                        }`}
                      >
                        {product.stock} шт.
                      </span>
                    </td>
                    <td className={s.td}>
                      <span
                        className={`${s.badge} ${
                          product.isActive
                            ? s.statusActive
                            : s.statusInactive
                        }`}
                      >
                        {product.isActive ? 'Активний' : 'Неактивний'}
                      </span>
                    </td>
                    <td className={s.td}>
                      <div className={s.actions}>
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className={s.editBtn}
                        >
                          <Pencil className={s.actionIcon} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className={s.deleteBtn}
                        >
                          <Trash2 className={s.actionIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className={s.emptyState}>
              {searchTerm ? 'Товари не знайдено' : 'Немає товарів'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
