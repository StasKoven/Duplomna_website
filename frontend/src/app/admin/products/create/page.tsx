'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'

const productSchema = z.object({
  name: z.string().min(3, 'Назва має містити мінімум 3 символи'),
  description: z.string().min(10, 'Опис має містити мінімум 10 символів'),
  shortDescription: z.string().optional(),
  price: z.number().min(0, 'Ціна має бути більше 0'),
  comparePrice: z.number().optional().nullable(),
  cost: z.number().min(0, 'Собівартість має бути більше 0').optional().default(0),
  category: z.string().min(1, 'Оберіть категорію'),
  brand: z.string().optional(),
  sku: z.string().min(1, 'SKU обов\'язковий'),
  stock: z.number().min(0, 'Кількість має бути більше або дорівнювати 0'),
  warranty: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function CreateProductPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [features, setFeatures] = useState<string[]>([''])
  const [specifications, setSpecifications] = useState<Array<{ name: string; value: string }>>([
    { name: '', value: '' },
  ])
  const [imageUrls, setImageUrls] = useState<string[]>([''])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/products/create')
    } else if (user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchCategories()
    }
  }, [isAuthenticated, user, router])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Помилка завантаження категорій')
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      console.log('📦 Submitting product data:', data)
      
      const productData = {
        ...data,
        features: features.filter((f) => f.trim() !== ''),
        specifications: specifications.filter((s) => s.name && s.value),
        images: imageUrls
          .filter((url) => url.trim() !== '')
          .map((url) => ({ url, alt: data.name })),
      }

      console.log('📤 Sending to API:', productData)
      
      const response = await api.post('/products', productData)
      
      console.log('✅ Product created:', response.data)
      toast.success('Товар успішно створено!')
      router.push('/admin/products')
    } catch (error: any) {
      console.error('❌ Error creating product:', error)
      console.error('Response data:', error.response?.data)
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Помилка створення товару'
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const addFeature = () => {
    setFeatures([...features, ''])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { name: '', value: '' }])
  }

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: 'name' | 'value', value: string) => {
    const newSpecs = [...specifications]
    newSpecs[index][field] = value
    setSpecifications(newSpecs)
  }

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад до списку товарів
        </Link>
        <h1 className="text-3xl font-bold">Створити новий товар</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        <div className="bg-card border rounded-lg p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Основна інформація</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Назва товару *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="iPhone 15 Pro Max"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Короткий опис
                </label>
                <input
                  {...register('shortDescription')}
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Найновіший флагман від Apple"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Повний опис *
                </label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Детальний опис товару..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ціноутворення</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ціна продажу *</label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="29999"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Стара ціна (для знижки)
                </label>
                <input
                  {...register('comparePrice', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="34999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Собівартість</label>
                <input
                  {...register('cost', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="25000"
                  defaultValue={0}
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-destructive">{errors.cost.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Category & Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Деталі</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Категорія *</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Оберіть категорію</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Бренд</label>
                <input
                  {...register('brand')}
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Apple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SKU *</label>
                <input
                  {...register('sku')}
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="IPHONE-15-PRO-MAX"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-destructive">{errors.sku.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Кількість на складі *</label>
                <input
                  {...register('stock', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="50"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-destructive">{errors.stock.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Гарантія</label>
                <input
                  {...register('warranty')}
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="12 місяців"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Зображення</h2>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className="text-sm text-primary hover:underline"
            >
              + Додати зображення
            </button>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Особливості</h2>
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Камера 48MP"
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="text-sm text-primary hover:underline"
            >
              + Додати особливість
            </button>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Характеристики</h2>
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Назва (Дисплей)"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Значення (6.7 дюймів)"
                />
                {specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecification}
              className="text-sm text-primary hover:underline"
            >
              + Додати характеристику
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Створення...' : 'Створити товар'}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-2 border rounded-md hover:bg-accent transition"
            >
              Скасувати
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
