'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { toast } from 'sonner'
import {
  ArrowLeft, X, Plus,
  Image as ImageIcon, Tag, Info, DollarSign,
  Package, Settings, Star, Loader2,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const productSchema = z.object({
  name: z.string().min(3, 'Назва має містити мінімум 3 символи'),
  description: z.string().min(10, 'Опис має містити мінімум 10 символів'),
  shortDescription: z.string().optional(),
  price: z.number().min(0.01, 'Ціна має бути більше 0'),
  comparePrice: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().positive('Стара ціна має бути більше 0').optional()
  ),
  cost: z.number().min(0, 'Собівартість має бути більше або дорівнювати 0').optional().default(0),
  category: z.string().min(1, 'Оберіть категорію'),
  brand: z.string().optional(),
  sku: z.string().min(1, 'SKU обов\'язковий'),
  stock: z.number().min(0, 'Кількість має бути більше або дорівнювати 0'),
  warranty: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
})

type ProductFormData = z.infer<typeof productSchema>

interface ImageItem {
  id: string
  url: string
  isMain: boolean
}

export default function CreateProductPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [specifications, setSpecifications] = useState<Array<{ name: string; value: string }>>([])
  const [images, setImages] = useState<ImageItem[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [slugPreview, setSlugPreview] = useState('')

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    pricing: true,
    details: true,
    images: true,
    features: false,
    specs: false,
    tags: false,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      isFeatured: false,
      stock: 0,
      cost: 0,
    },
  })

  const watchName = watch('name')
  const watchPrice = watch('price')
  const watchComparePrice = watch('comparePrice')

  useEffect(() => {
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9а-яіїєґ\s-]+/gi, '')
        .replace(/\s+/g, '-')
        .replace(/^-|-$/g, '')
      setSlugPreview(slug)
    } else {
      setSlugPreview('')
    }
  }, [watchName])

  const generateSku = useCallback(() => {
    if (watchName) {
      const sku = watchName
        .toUpperCase()
        .replace(/[^A-ZА-ЯІЇЄҐ0-9\s]+/gi, '')
        .replace(/\s+/g, '-')
        .slice(0, 30)
      setValue('sku', sku)
    }
  }, [watchName, setValue])

  const discountPercent = watchPrice && watchComparePrice && watchComparePrice > watchPrice
    ? Math.round(((watchComparePrice - watchPrice) / watchComparePrice) * 100)
    : 0

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

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ===== Images =====
  const addImage = () => {
    if (!newImageUrl.trim()) return
    const exists = images.some(img => img.url === newImageUrl.trim())
    if (exists) {
      toast.error('Це зображення вже додано')
      return
    }
    const newImg: ImageItem = {
      id: Date.now().toString(),
      url: newImageUrl.trim(),
      isMain: images.length === 0,
    }
    setImages(prev => [...prev, newImg])
    setNewImageUrl('')
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id)
      if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
        filtered[0].isMain = true
      }
      return filtered
    })
  }

  const setMainImage = (id: string) => {
    setImages(prev => prev.map(img => ({ ...img, isMain: img.id === id })))
  }

  const handleImageError = (id: string) => {
    setImageError(prev => ({ ...prev, [id]: true }))
  }

  const handleImageLoad = (id: string) => {
    setImageError(prev => ({ ...prev, [id]: false }))
  }

  // ===== Features =====
  const addFeature = () => setFeatures(prev => [...prev, ''])
  const removeFeature = (index: number) => setFeatures(prev => prev.filter((_, i) => i !== index))
  const updateFeature = (index: number, value: string) => {
    setFeatures(prev => prev.map((f, i) => i === index ? value : f))
  }

  // ===== Specifications =====
  const addSpecification = () => setSpecifications(prev => [...prev, { name: '', value: '' }])
  const removeSpecification = (index: number) => setSpecifications(prev => prev.filter((_, i) => i !== index))
  const updateSpecification = (index: number, field: 'name' | 'value', value: string) => {
    setSpecifications(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  // ===== Tags =====
  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag) return
    if (tags.includes(tag)) {
      toast.error('Цей тег вже додано')
      return
    }
    setTags(prev => [...prev, tag])
    setTagInput('')
  }

  const removeTag = (index: number) => setTags(prev => prev.filter((_, i) => i !== index))

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // ===== Submit =====
  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      toast.error('Додайте хоча б одне зображення')
      setOpenSections(prev => ({ ...prev, images: true }))
      return
    }

    setIsLoading(true)
    try {
      const productData: Record<string, any> = {
        ...data,
        features: features.filter(f => f.trim() !== ''),
        specifications: specifications.filter(s => s.name.trim() && s.value.trim()),
        tags: tags.filter(t => t.trim() !== ''),
        images: images.map(img => ({
          url: img.url,
          alt: data.name,
          isMain: img.isMain,
        })),
      }

      // Remove comparePrice if not set
      if (!productData.comparePrice) {
        delete productData.comparePrice
      }

      await api.post('/products', productData)
      toast.success('Товар успішно створено!')
      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Помилка створення товару'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') return null

  const SectionHeader = ({
    title,
    icon: Icon,
    sectionKey,
    count,
    description,
  }: {
    title: string
    icon: any
    sectionKey: string
    count?: number
    description?: string
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-3 group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            {count !== undefined && count > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {count}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {openSections[sectionKey] ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  )

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
        {slugPreview && (
          <p className="text-sm text-muted-foreground mt-1">
            URL: /products/<span className="text-primary font-medium">{slugPreview}</span>-...
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-4">
        {/* ===== BASIC INFO ===== */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 border-b">
            <SectionHeader
              title="Основна інформація"
              icon={Info}
              sectionKey="basic"
              description="Назва, опис та основні дані"
            />
          </div>
          <AnimatePresence initial={false}>
            {openSections.basic && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Назва товару *</label>
                    <input
                      {...register('name')}
                      type="text"
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                      placeholder="iPhone 15 Pro Max 256GB"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Короткий опис</label>
                    <input
                      {...register('shortDescription')}
                      type="text"
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                      placeholder="Найновіший флагман від Apple з чіпом A17 Pro"
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Для каталогу (до 500 символів)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Повний опис *</label>
                    <textarea
                      {...register('description')}
                      rows={6}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition resize-y"
                      placeholder="Детальний опис товару, переваги, комплектація..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="relative inline-flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register('isActive')} className="sr-only peer" />
                      <div className="relative w-10 h-6 bg-muted rounded-full peer-checked:bg-green-500 transition-colors flex-shrink-0">
                        <div className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 shadow-sm transition-transform peer-checked:translate-x-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Активний товар</span>
                        <p className="text-xs text-muted-foreground">Відображається на сайті</p>
                      </div>
                    </label>
                    <label className="relative inline-flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register('isFeatured')} className="sr-only peer" />
                      <div className="relative w-10 h-6 bg-muted rounded-full peer-checked:bg-yellow-500 transition-colors flex-shrink-0">
                        <div className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 shadow-sm transition-transform peer-checked:translate-x-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Рекомендований</span>
                        <p className="text-xs text-muted-foreground">Показується на головній</p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== PRICING ===== */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 border-b">
            <SectionHeader title="Ціноутворення" icon={DollarSign} sectionKey="pricing" description="Ціни та знижки" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.pricing && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ціна продажу * <span className="text-muted-foreground">(₴)</span></label>
                      <div className="relative">
                        <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="29999" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₴</span>
                      </div>
                      {errors.price && <p className="mt-1 text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.price.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Стара ціна <span className="text-muted-foreground">(для знижки)</span></label>
                      <div className="relative">
                        <input {...register('comparePrice')} type="number" step="0.01" min="0" className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="34999" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₴</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Собівартість</label>
                      <div className="relative">
                        <input {...register('cost', { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="25000" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₴</span>
                      </div>
                    </div>
                  </div>

                  {discountPercent > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <div className="p-1.5 bg-green-500 text-white rounded-full">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">Знижка {discountPercent}%</p>
                        <p className="text-xs text-green-600 dark:text-green-500">Економія: {((watchComparePrice || 0) - (watchPrice || 0)).toLocaleString('uk-UA')} ₴</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== DETAILS ===== */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 border-b">
            <SectionHeader title="Деталі товару" icon={Package} sectionKey="details" description="Категорія, бренд, склад та гарантія" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.details && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Категорія *</label>
                      <select {...register('category')} className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition bg-background">
                        <option value="">Оберіть категорію</option>
                        {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                      </select>
                      {errors.category && <p className="mt-1 text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.category.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Бренд</label>
                      <input {...register('brand')} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="Apple" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">SKU (Артикул) *</label>
                      <div className="flex gap-2">
                        <input {...register('sku')} type="text" className="flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-mono uppercase" placeholder="IPHONE-15-PRO-MAX" />
                        <button type="button" onClick={generateSku} className="px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition whitespace-nowrap" title="Згенерувати з назви">Авто</button>
                      </div>
                      {errors.sku && <p className="mt-1 text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.sku.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Кількість на складі *</label>
                      <input {...register('stock', { valueAsNumber: true })} type="number" min="0" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="50" />
                      {errors.stock && <p className="mt-1 text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{errors.stock.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Гарантія</label>
                      <input {...register('warranty')} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="12 місяців" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== IMAGES ===== */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 border-b">
            <SectionHeader title="Зображення" icon={ImageIcon} sectionKey="images" count={images.length} description="Фотографії товару (перше = головне)" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.images && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                      className="flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button type="button" onClick={addImage} disabled={!newImageUrl.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Додати
                    </button>
                  </div>

                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {images.map((img) => (
                        <motion.div
                          key={img.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-colors ${img.isMain ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'}`}
                        >
                          {!imageError[img.id] ? (
                            <Image src={img.url} alt="Product" fill className="object-cover" onError={() => handleImageError(img.id)} onLoad={() => handleImageLoad(img.id)} />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-muted text-muted-foreground p-2 text-center">
                              <AlertCircle className="h-6 w-6 mb-1" />
                              <span className="text-xs">Помилка</span>
                            </div>
                          )}
                          {img.isMain && (
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full">Головне</div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {!img.isMain && (
                              <button type="button" onClick={() => setMainImage(img.id)} className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition" title="Зробити головним">
                                <Star className="h-4 w-4" />
                              </button>
                            )}
                            <button type="button" onClick={() => removeImage(img.id)} className="p-2 bg-white rounded-full text-destructive hover:bg-destructive hover:text-white transition" title="Видалити">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Додайте URL зображень товару</p>
                      <p className="text-xs mt-1">Перше додане зображення стане головним</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== FEATURES ===== */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 border-b">
            <SectionHeader title="Особливості" icon={CheckCircle} sectionKey="features" count={features.filter(f => f.trim()).length} description="Ключові переваги товару" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.features && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-6 space-y-3">
                  {features.map((feature, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <input type="text" value={feature} onChange={e => updateFeature(index, e.target.value)} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="Камера 48MP з оптичною стабілізацією" />
                      <button type="button" onClick={() => removeFeature(index)} className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                  <button type="button" onClick={addFeature} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition">
                    <Plus className="h-4 w-4" />
                    Додати особливість
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== SPECIFICATIONS ===== */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 border-b">
            <SectionHeader title="Характеристики" icon={Settings} sectionKey="specs" count={specifications.filter(s => s.name.trim() && s.value.trim()).length} description="Технічні характеристики (дисплей, процесор...)" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.specs && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-6 space-y-3">
                  {specifications.map((spec, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                      <input type="text" value={spec.name} onChange={e => updateSpecification(index, 'name', e.target.value)} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="Назва (Дисплей)" />
                      <input type="text" value={spec.value} onChange={e => updateSpecification(index, 'value', e.target.value)} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder={'Значення (6.7" OLED 120Hz)'} />
                      <button type="button" onClick={() => removeSpecification(index)} className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                  <button type="button" onClick={addSpecification} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition">
                    <Plus className="h-4 w-4" />
                    Додати характеристику
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== TAGS ===== */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 border-b">
            <SectionHeader title="Теги" icon={Tag} sectionKey="tags" count={tags.length} description="Додаткові ключові слова для пошуку" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.tags && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-6 space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" placeholder="Введіть тег та натисніть Enter" />
                    <button type="button" onClick={addTag} disabled={!tagInput.trim()} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition disabled:opacity-50">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <motion.span key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          #{tag}
                          <button type="button" onClick={() => removeTag(index)} className="ml-1 hover:text-destructive transition">
                            <X className="h-3 w-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="text-destructive">*</span> — обов&apos;язкові поля
            </div>
            <div className="flex gap-3">
              <Link href="/admin/products" className="px-6 py-2.5 border rounded-lg hover:bg-accent transition font-medium">
                Скасувати
              </Link>
              <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2">
                {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" />Створення...</>) : (<><CheckCircle className="h-4 w-4" />Створити товар</>)}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
