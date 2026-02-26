'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'
import s from './page.module.css'

const productSchema = z.object({
  name: z.string().min(3, 'Назва має містити мінімум 3 символи'),
  description: z.string().min(10, 'Опис має містити мінімум 10 символів'),
  shortDescription: z.string().optional(),
  price: z.number().min(0, 'Ціна має бути більше 0'),
  comparePrice: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().positive('Стара ціна має бути більше 0').optional()
  ),
  cost: z.number().min(0, 'Собівартість має бути більше 0').optional().default(0),
  category: z.string().min(1, 'Оберіть категорію'),
  brand: z.string().optional(),
  sku: z.string().min(1, 'SKU обов\'язковий'),
  stock: z.number().min(0, 'Кількість має бути більше або дорівнювати 0'),
  warranty: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [features, setFeatures] = useState<string[]>([''])
  const [specifications, setSpecifications] = useState<Array<{ name: string; value: string }>>([
    { name: '', value: '' },
  ])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [product, setProduct] = useState<Product | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/admin/products/${productId}/edit`)
    } else if (user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchCategories()
      fetchProduct()
    }
  }, [isAuthenticated, user, router, productId])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Помилка завантаження категорій')
    }
  }

  const fetchProduct = async () => {
    try {
      setIsFetching(true)
      const response = await api.get(`/products/${productId}`)
      const productData = response.data.product
      setProduct(productData)
      
      // Set form values
      reset({
        name: productData.name,
        description: productData.description,
        shortDescription: productData.shortDescription || '',
        price: productData.price,
        comparePrice: productData.comparePrice || undefined,
        cost: productData.cost || 0,
        category: typeof productData.category === 'object' ? productData.category._id : productData.category,
        brand: productData.brand || '',
        sku: productData.sku,
        stock: productData.stock,
        warranty: productData.warranty || '',
        isActive: productData.isActive,
        isFeatured: productData.isFeatured,
      })

      // Set features
      if (productData.features && productData.features.length > 0) {
        setFeatures(productData.features)
      }

      // Set specifications
      if (productData.specifications && productData.specifications.length > 0) {
        setSpecifications(productData.specifications)
      }

      // Set images
      if (productData.images && productData.images.length > 0) {
        setImageUrls(productData.images.map((img: any) => img.url))
      }

    } catch (error: any) {
      console.error('Error fetching product:', error)
      if (error.response?.status === 404) {
        toast.error('Товар не знайдено')
        router.push('/admin/products')
      } else {
        toast.error('Помилка завантаження товару')
      }
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      const productData = {
        ...data,
        features: features.filter((f) => f.trim() !== ''),
        specifications: specifications.filter((s) => s.name && s.value),
        images: imageUrls
          .filter((url) => url.trim() !== '')
          .map((url) => ({ url, alt: data.name })),
      }

      await api.put(`/products/${productId}`, productData)
      toast.success('Товар успішно оновлено!')
      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error updating product:', error)
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Помилка оновлення товару'
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

  if (isFetching) {
    return (
      <div className={`container-custom ${s.page}`}>
        <div className={s.loadingCenter}>
          <Loader2 className={s.spinner} />
          <span className={s.loadingText}>Завантаження...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.headerSection}>
        <Link
          href="/admin/products"
          className={s.backLink}
        >
          <ArrowLeft className={s.backIcon} />
          Назад до списку товарів
        </Link>
        <h1 className={s.title}>Редагувати товар</h1>
        {product && (
          <p className={s.productName}>{product.name}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
        <div className={s.card}>
          {/* Basic Info */}
          <div className={s.section}>
            <h2 className={s.sectionTitle}>Основна інформація</h2>

            <div className={s.grid2}>
              <div className={s.colSpan2}>
                <label className={s.label}>
                  Назва товару *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className={s.input}
                  placeholder="iPhone 15 Pro Max"
                />
                {errors.name && (
                  <p className={s.error}>{errors.name.message}</p>
                )}
              </div>

              <div className={s.colSpan2}>
                <label className={s.label}>
                  Короткий опис
                </label>
                <input
                  {...register('shortDescription')}
                  type="text"
                  className={s.input}
                  placeholder="Найновіший флагман від Apple"
                />
              </div>

              <div className={s.colSpan2}>
                <label className={s.label}>
                  Повний опис *
                </label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className={s.textarea}
                  placeholder="Детальний опис товару..."
                />
                {errors.description && (
                  <p className={s.error}>
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className={s.section}>
            <h2 className={s.sectionTitle}>Ціноутворення</h2>

            <div className={s.grid3}>
              <div>
                <label className={s.label}>Ціна продажу *</label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className={s.input}
                  placeholder="29999"
                />
                {errors.price && (
                  <p className={s.error}>{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className={s.label}>
                  Стара ціна (для знижки)
                </label>
                <input
                  {...register('comparePrice')}
                  type="number"
                  step="0.01"
                  className={s.input}
                  placeholder="34999"
                />
              </div>

              <div>
                <label className={s.label}>Собівартість</label>
                <input
                  {...register('cost', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className={s.input}
                  placeholder="25000"
                />
                {errors.cost && (
                  <p className={s.error}>{errors.cost.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Category & Details */}
          <div className={s.section}>
            <h2 className={s.sectionTitle}>Деталі</h2>

            <div className={s.grid2}>
              <div>
                <label className={s.label}>Категорія *</label>
                <select
                  {...register('category')}
                  className={s.input}
                >
                  <option value="">Оберіть категорію</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className={s.error}>
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className={s.label}>Бренд</label>
                <input
                  {...register('brand')}
                  type="text"
                  className={s.input}
                  placeholder="Apple"
                />
              </div>

              <div>
                <label className={s.label}>SKU *</label>
                <input
                  {...register('sku')}
                  type="text"
                  className={s.input}
                  placeholder="IPHONE-15-PRO-MAX"
                />
                {errors.sku && (
                  <p className={s.error}>{errors.sku.message}</p>
                )}
              </div>

              <div>
                <label className={s.label}>Кількість на складі *</label>
                <input
                  {...register('stock', { valueAsNumber: true })}
                  type="number"
                  className={s.input}
                  placeholder="50"
                />
                {errors.stock && (
                  <p className={s.error}>{errors.stock.message}</p>
                )}
              </div>

              <div>
                <label className={s.label}>Гарантія</label>
                <input
                  {...register('warranty')}
                  type="text"
                  className={s.input}
                  placeholder="12 місяців"
                />
              </div>
            </div>

            {/* Status toggles */}
            <div className={s.toggleRow}>
              <label className={s.toggleLabel}>
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className={s.checkbox}
                />
                <span className={s.toggleText}>Активний товар</span>
              </label>
              <label className={s.toggleLabel}>
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  className={s.checkbox}
                />
                <span className={s.toggleText}>Рекомендований товар</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div className={s.section}>
            <h2 className={s.sectionTitle}>Зображення</h2>
            {imageUrls.map((url, index) => (
              <div key={index} className={s.fieldRow}>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  className={s.fieldInput}
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className={s.removeBtn}
                  >
                    <X className={s.removeIcon} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className={s.addLink}
            >
              + Додати зображення
            </button>
          </div>

          {/* Features */}
          <div className={s.section}>
            <h2 className={s.sectionTitle}>Особливості</h2>
            {features.map((feature, index) => (
              <div key={index} className={s.fieldRow}>
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className={s.fieldInput}
                  placeholder="Камера 48MP"
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className={s.removeBtn}
                  >
                    <X className={s.removeIcon} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className={s.addLink}
            >
              + Додати особливість
            </button>
          </div>

          {/* Specifications */}
          <div className={s.section}>
            <h2 className={s.sectionTitle}>Характеристики</h2>
            {specifications.map((spec, index) => (
              <div key={index} className={s.fieldRow}>
                <input
                  type="text"
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  className={s.fieldInput}
                  placeholder="Назва (Дисплей)"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  className={s.fieldInput}
                  placeholder="Значення (6.7 дюймів)"
                />
                {specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className={s.removeBtn}
                  >
                    <X className={s.removeIcon} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecification}
              className={s.addLink}
            >
              + Додати характеристику
            </button>
          </div>

          {/* Actions */}
          <div className={s.actions}>
            <button
              type="submit"
              disabled={isLoading}
              className={s.submitBtn}
            >
              {isLoading && <Loader2 className={s.submitSpinner} />}
              {isLoading ? 'Збереження...' : 'Зберегти зміни'}
            </button>
            <Link
              href="/admin/products"
              className={s.cancelBtn}
            >
              Скасувати
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
