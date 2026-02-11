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
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Керування товарами</h1>
          <p className="text-muted-foreground">
            Всього товарів: {products.length}
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition"
        >
          <Plus className="h-5 w-5" />
          Додати товар
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Пошук товарів..."
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
                  <th className="text-left py-3 px-4">Зображення</th>
                  <th className="text-left py-3 px-4">Назва</th>
                  <th className="text-left py-3 px-4">Ціна</th>
                  <th className="text-left py-3 px-4">Запас</th>
                  <th className="text-left py-3 px-4">Статус</th>
                  <th className="text-right py-3 px-4">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-t hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden">
                        {product.images[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-2xl">
                            📱
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.slug}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{formatPrice(product.price)}</div>
                      {product.comparePrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.comparePrice)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : product.stock < 5
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {product.stock} шт.
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          product.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {product.isActive ? 'Активний' : 'Неактивний'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="p-2 hover:bg-accent rounded-md transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? 'Товари не знайдено' : 'Немає товарів'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
