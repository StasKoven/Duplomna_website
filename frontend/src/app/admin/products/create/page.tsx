'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
  Package, Settings, Star, Loader2, Upload,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import s from './page.module.css'

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
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const watchActive = watch('isActive')
  const watchFeatured = watch('isFeatured')

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingFiles(true)
    try {
      // Upload sequentially so errors per file are clear, but each one only
      // takes ~1s for typical product photos.
      const uploaded: ImageItem[] = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        try {
          const res = await api.post('/uploads/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          uploaded.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: res.data.url,
            isMain: false,
          })
        } catch (err: any) {
          toast.error(`${file.name}: ${err?.response?.data?.message || err.message || 'Помилка завантаження'}`)
        }
      }

      if (uploaded.length > 0) {
        setImages(prev => {
          const next = [...prev, ...uploaded]
          if (!next.some(i => i.isMain)) next[0].isMain = true
          return next
        })
        toast.success(`Завантажено: ${uploaded.length}`)
      }
    } finally {
      setUploadingFiles(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
    setSpecifications(prev => prev.map((sp, i) => i === index ? { ...sp, [field]: value } : sp))
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

  // Auto-open sections that contain validation errors so the user can see them.
  useEffect(() => {
    const errored: Record<string, boolean> = {}
    if (errors.name || errors.description) errored.basic = true
    if (errors.price || errors.comparePrice) errored.pricing = true
    if (errors.category || errors.sku || errors.stock) errored.details = true
    if (Object.keys(errored).length > 0) {
      setOpenSections(prev => ({ ...prev, ...errored }))
    }
  }, [errors])

  const onInvalid = () => {
    toast.error('Перевірте заповнення обовʼязкових полів')
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
        specifications: specifications.filter(sp => sp.name.trim() && sp.value.trim()),
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
      className={`${s.sectionHeaderBtn} group`}
    >
      <div className={s.sectionHeaderLeft}>
        <div className={s.sectionIconWrap}>
          <Icon className={s.sectionIcon} />
        </div>
        <div className={s.sectionTextWrap}>
          <div className={s.sectionTitleRow}>
            <h2 className={s.sectionTitle}>{title}</h2>
            {count !== undefined && count > 0 && (
              <span className={s.sectionCount}>
                {count}
              </span>
            )}
          </div>
          {description && (
            <p className={s.sectionDescription}>{description}</p>
          )}
        </div>
      </div>
      {openSections[sectionKey] ? (
        <ChevronUp className={s.chevronIcon} />
      ) : (
        <ChevronDown className={s.chevronIcon} />
      )}
    </button>
  )

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.topSection}>
        <Link
          href="/admin/products"
          className={s.backLink}
        >
          <ArrowLeft className={s.backIcon} />
          Назад до списку товарів
        </Link>
        <h1 className={s.pageTitle}>Створити новий товар</h1>
        {slugPreview && (
          <p className={s.slugPreview}>
            URL: /products/<span className={s.slugHighlight}>{slugPreview}</span>-...
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className={s.form}>
        {/* ===== BASIC INFO ===== */}
        <div className={s.sectionCard}>
          <div className={s.sectionHeaderWrap}>
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
                className={s.collapseWrap}
              >
                <div className={s.sectionBody}>
                  <div>
                    <label className={s.label}>Назва товару *</label>
                    <input
                      {...register('name')}
                      type="text"
                      className={s.input}
                      placeholder="iPhone 15 Pro Max 256GB"
                    />
                    {errors.name && (
                      <p className={s.fieldError}>
                        <AlertCircle className={s.errorIcon} />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={s.label}>Короткий опис</label>
                    <input
                      {...register('shortDescription')}
                      type="text"
                      className={s.input}
                      placeholder="Найновіший флагман від Apple з чіпом A17 Pro"
                      maxLength={500}
                    />
                    <p className={s.fieldHint}>Для каталогу (до 500 символів)</p>
                  </div>

                  <div>
                    <label className={s.label}>Повний опис *</label>
                    <textarea
                      {...register('description')}
                      rows={6}
                      className={s.textarea}
                      placeholder="Детальний опис товару, переваги, комплектація..."
                    />
                    {errors.description && (
                      <p className={s.fieldError}>
                        <AlertCircle className={s.errorIcon} />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className={s.togglesRow}>
                    <label className={s.toggleLabel}>
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        className={s.srOnly}
                      />
                      <div
                        className={`${s.toggleTrack} ${watchActive ? s.toggleTrackOnGreen : s.toggleTrackOff}`}
                      >
                        <div
                          className={`${s.toggleKnob} ${watchActive ? s.toggleKnobOn : ''}`}
                        />
                      </div>
                      <div>
                        <span className={s.toggleTitle}>Активний товар</span>
                        <p className={s.toggleHint}>Відображається на сайті</p>
                      </div>
                    </label>
                    <label className={s.toggleLabel}>
                      <input
                        type="checkbox"
                        {...register('isFeatured')}
                        className={s.srOnly}
                      />
                      <div
                        className={`${s.toggleTrack} ${watchFeatured ? s.toggleTrackOnYellow : s.toggleTrackOff}`}
                      >
                        <div
                          className={`${s.toggleKnob} ${watchFeatured ? s.toggleKnobOn : ''}`}
                        />
                      </div>
                      <div>
                        <span className={s.toggleTitle}>Рекомендований</span>
                        <p className={s.toggleHint}>Показується на головній</p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== PRICING ===== */}
        <div className={s.sectionCard}>
          <div className={s.sectionHeaderWrap}>
            <SectionHeader title="Ціноутворення" icon={DollarSign} sectionKey="pricing" description="Ціни та знижки" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.pricing && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className={s.collapseWrap}>
                <div className={s.sectionBody}>
                  <div className={s.priceGrid}>
                    <div>
                      <label className={s.label}>Ціна продажу * <span className={s.labelHint}>(₴)</span></label>
                      <div className={s.inputWrap}>
                        <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" min="0" className={s.priceInput} placeholder="29999" />
                        <span className={s.currencySymbol}>₴</span>
                      </div>
                      {errors.price && <p className={s.fieldError}><AlertCircle className={s.errorIcon} />{errors.price.message}</p>}
                    </div>
                    <div>
                      <label className={s.label}>Стара ціна <span className={s.labelHint}>(для знижки)</span></label>
                      <div className={s.inputWrap}>
                        <input {...register('comparePrice')} type="number" step="0.01" min="0" className={s.priceInput} placeholder="34999" />
                        <span className={s.currencySymbol}>₴</span>
                      </div>
                    </div>
                    <div>
                      <label className={s.label}>Собівартість</label>
                      <div className={s.inputWrap}>
                        <input {...register('cost', { valueAsNumber: true })} type="number" step="0.01" min="0" className={s.priceInput} placeholder="25000" />
                        <span className={s.currencySymbol}>₴</span>
                      </div>
                    </div>
                  </div>

                  {discountPercent > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={s.discountBanner}
                    >
                      <div className={s.discountIconWrap}>
                        <Tag className={s.discountIconInner} />
                      </div>
                      <div>
                        <p className={s.discountText}>Знижка {discountPercent}%</p>
                        <p className={s.discountSavings}>Економія: {((watchComparePrice || 0) - (watchPrice || 0)).toLocaleString('uk-UA')} ₴</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== DETAILS ===== */}
        <div className={s.sectionCard}>
          <div className={s.sectionHeaderWrap}>
            <SectionHeader title="Деталі товару" icon={Package} sectionKey="details" description="Категорія, бренд, склад та гарантія" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.details && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className={s.collapseWrap}>
                <div className={s.sectionBodyPlain}>
                  <div className={s.detailsGrid}>
                    <div>
                      <label className={s.label}>Категорія *</label>
                      <select {...register('category')} className={s.select}>
                        <option value="">Оберіть категорію</option>
                        {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                      </select>
                      {errors.category && <p className={s.fieldError}><AlertCircle className={s.errorIcon} />{errors.category.message}</p>}
                    </div>
                    <div>
                      <label className={s.label}>Бренд</label>
                      <input {...register('brand')} type="text" className={s.input} placeholder="Apple" />
                    </div>
                    <div>
                      <label className={s.label}>SKU (Артикул) *</label>
                      <div className={s.skuRow}>
                        <input {...register('sku')} type="text" className={s.skuInput} placeholder="IPHONE-15-PRO-MAX" />
                        <button type="button" onClick={generateSku} className={s.autoBtn} title="Згенерувати з назви">Авто</button>
                      </div>
                      {errors.sku && <p className={s.fieldError}><AlertCircle className={s.errorIcon} />{errors.sku.message}</p>}
                    </div>
                    <div>
                      <label className={s.label}>Кількість на складі *</label>
                      <input {...register('stock', { valueAsNumber: true })} type="number" min="0" className={s.input} placeholder="50" />
                      {errors.stock && <p className={s.fieldError}><AlertCircle className={s.errorIcon} />{errors.stock.message}</p>}
                    </div>
                    <div>
                      <label className={s.label}>Гарантія</label>
                      <input {...register('warranty')} type="text" className={s.input} placeholder="12 місяців" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== IMAGES ===== */}
        <div className={s.sectionCard}>
          <div className={s.sectionHeaderWrap}>
            <SectionHeader title="Зображення" icon={ImageIcon} sectionKey="images" count={images.length} description="Фотографії товару (перше = головне)" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.images && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className={s.collapseWrap}>
                <div className={s.sectionBody}>
                  <div className={s.imageUrlRow}>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                      className={s.imageUrlInput}
                      placeholder="https://example.com/image.jpg"
                    />
                    <button type="button" onClick={addImage} disabled={!newImageUrl.trim()} className={s.addImageBtn}>
                      <Plus className={s.addImageBtnIcon} />
                      Додати URL
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFiles}
                      className={s.addImageBtn}
                    >
                      {uploadingFiles ? (
                        <Loader2 className={s.addImageBtnIcon} />
                      ) : (
                        <Upload className={s.addImageBtnIcon} />
                      )}
                      {uploadingFiles ? 'Завантаження...' : 'Завантажити з ПК'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {images.length > 0 ? (
                    <div className={s.imageGrid}>
                      {images.map((img) => (
                        <motion.div
                          key={img.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`${s.imageCard} group ${img.isMain ? s.imageCardMain : s.imageCardDefault}`}
                        >
                          {!imageError[img.id] ? (
                            <Image src={img.url} alt="Product" fill className={s.imageCover} onError={() => handleImageError(img.id)} onLoad={() => handleImageLoad(img.id)} />
                          ) : (
                            <div className={s.imageErrorPlaceholder}>
                              <AlertCircle className={s.imageErrorIcon} />
                              <span className={s.imageErrorText}>Помилка</span>
                            </div>
                          )}
                          {img.isMain && (
                            <div className={s.mainBadge}>Головне</div>
                          )}
                          <div className={s.imageOverlay}>
                            {!img.isMain && (
                              <button type="button" onClick={() => setMainImage(img.id)} className={s.setMainBtn} title="Зробити головним">
                                <Star className={s.smallIcon} />
                              </button>
                            )}
                            <button type="button" onClick={() => removeImage(img.id)} className={s.removeImgBtn} title="Видалити">
                              <X className={s.smallIcon} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className={s.emptyImages}>
                      <ImageIcon className={s.emptyImagesIcon} />
                      <p className={s.emptyImagesText}>Додайте зображення товару</p>
                      <p className={s.emptyImagesHint}>
                        Можна вставити URL або завантажити файл з ПК. Перше додане зображення стане головним.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== FEATURES ===== */}
        <div className={s.sectionCard}>
          <div className={s.sectionHeaderWrap}>
            <SectionHeader title="Особливості" icon={CheckCircle} sectionKey="features" count={features.filter(f => f.trim()).length} description="Ключові переваги товару" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.features && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className={s.collapseWrap}>
                <div className={s.sectionBodyCompact}>
                  {features.map((feature, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={s.featureRow}>
                      <CheckCircle className={s.featureCheckIcon} />
                      <input type="text" value={feature} onChange={e => updateFeature(index, e.target.value)} className={s.featureInput} placeholder="Камера 48MP з оптичною стабілізацією" />
                      <button type="button" onClick={() => removeFeature(index)} className={s.removeItemBtn}>
                        <X className={s.removeItemIcon} />
                      </button>
                    </motion.div>
                  ))}
                  <button type="button" onClick={addFeature} className={s.addItemBtn}>
                    <Plus className={s.addItemIcon} />
                    Додати особливість
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== SPECIFICATIONS ===== */}
        <div className={s.sectionCard}>
          <div className={s.sectionHeaderWrap}>
            <SectionHeader title="Характеристики" icon={Settings} sectionKey="specs" count={specifications.filter(sp => sp.name.trim() && sp.value.trim()).length} description="Технічні характеристики (дисплей, процесор...)" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.specs && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className={s.collapseWrap}>
                <div className={s.sectionBodyCompact}>
                  {specifications.map((spec, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={s.specRow}>
                      <input type="text" value={spec.name} onChange={e => updateSpecification(index, 'name', e.target.value)} className={s.specInput} placeholder="Назва (Дисплей)" />
                      <input type="text" value={spec.value} onChange={e => updateSpecification(index, 'value', e.target.value)} className={s.specInput} placeholder={'Значення (6.7" OLED 120Hz)'} />
                      <button type="button" onClick={() => removeSpecification(index)} className={s.removeItemBtn}>
                        <X className={s.removeItemIcon} />
                      </button>
                    </motion.div>
                  ))}
                  <button type="button" onClick={addSpecification} className={s.addItemBtn}>
                    <Plus className={s.addItemIcon} />
                    Додати характеристику
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== TAGS ===== */}
        <div className={s.sectionCard}>
          <div className={s.sectionHeaderWrap}>
            <SectionHeader title="Теги" icon={Tag} sectionKey="tags" count={tags.length} description="Додаткові ключові слова для пошуку" />
          </div>
          <AnimatePresence initial={false}>
            {openSections.tags && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className={s.collapseWrap}>
                <div className={s.sectionBodyCompact}>
                  <div className={s.tagInputRow}>
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className={s.tagInput} placeholder="Введіть тег та натисніть Enter" />
                    <button type="button" onClick={addTag} disabled={!tagInput.trim()} className={s.addTagBtn}>
                      <Plus className={s.addTagIcon} />
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className={s.tagsList}>
                      {tags.map((tag, index) => (
                        <motion.span key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={s.tag}>
                          #{tag}
                          <button type="button" onClick={() => removeTag(index)} className={s.removeTagBtn}>
                            <X className={s.removeTagIcon} />
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
        <div className={s.actionsCard}>
          <div className={s.actionsRow}>
            <div className={s.requiredNote}>
              <span className={s.asterisk}>*</span> — обов&apos;язкові поля
            </div>
            <div className={s.actionButtons}>
              <Link href="/admin/products" className={s.cancelBtn}>
                Скасувати
              </Link>
              <button type="submit" disabled={isLoading} className={s.submitBtn}>
                {isLoading ? (<><Loader2 className={s.spinIcon} />Створення...</>) : (<><CheckCircle className={s.submitIcon} />Створити товар</>)}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
