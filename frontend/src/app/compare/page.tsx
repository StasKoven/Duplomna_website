'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { X, ArrowLeft, ShoppingCart, Eye, EyeOff, Star, Check, Minus, BarChart3, Trash2, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useComparisonStore } from '@/store/comparisonStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { Product } from '@/types'

function ComparisonContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category')

  const { comparisons, removeFromComparison, clearComparison } = useComparisonStore()
  const { addItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)
  const [highlightBest, setHighlightBest] = useState(true)

  const comparison = categoryId
    ? comparisons.find(c => c.categoryId === categoryId)
    : comparisons[0]

  useEffect(() => {
    if (!comparison && comparisons.length > 0) {
      router.push(`/compare?category=${comparisons[0].categoryId}`)
    }
  }, [comparison, comparisons, router])

  const products = comparison?.products || []

  // Collect all specification names
  const allSpecs = useMemo(() => {
    const specs = new Map<string, string[]>()
    products.forEach(product => {
      product.specifications?.forEach(spec => {
        if (!specs.has(spec.name)) {
          specs.set(spec.name, [])
        }
        specs.get(spec.name)!.push(spec.value)
      })
    })
    return specs
  }, [products])

  // Collect all feature names
  const allFeatures = useMemo(() => {
    const features = new Set<string>()
    products.forEach(product => {
      product.features?.forEach(f => features.add(f))
    })
    return Array.from(features)
  }, [products])

  // Determine which rows have differences
  const hasDifference = useMemo(() => {
    const diff: Record<string, boolean> = {}

    // Price
    const prices = products.map(p => p.price)
    diff['price'] = new Set(prices).size > 1

    // Rating
    const ratings = products.map(p => p.rating?.average?.toFixed(1) || '0')
    diff['rating'] = new Set(ratings).size > 1

    // Stock
    const stocks = products.map(p => p.stock > 0 ? 'yes' : 'no')
    diff['stock'] = new Set(stocks).size > 1

    // Brand
    const brands = products.map(p => p.brand || '-')
    diff['brand'] = new Set(brands).size > 1

    // Warranty
    const warranties = products.map(p => p.warranty || '-')
    diff['warranty'] = new Set(warranties).size > 1

    // Specs
    allSpecs.forEach((values, name) => {
      const specValues = products.map(p => {
        const spec = p.specifications?.find(s => s.name === name)
        return spec?.value || '-'
      })
      diff[`spec-${name}`] = new Set(specValues).size > 1
    })

    // Features
    allFeatures.forEach(feature => {
      const has = products.map(p => p.features?.includes(feature) ? 'yes' : 'no')
      diff[`feature-${feature}`] = new Set(has).size > 1
    })

    return diff
  }, [products, allSpecs, allFeatures])

  // Find best values for highlighting
  const bestValues = useMemo(() => {
    const best: Record<string, string> = {}

    if (products.length < 2) return best

    // Lowest price is best
    const minPrice = Math.min(...products.map(p => p.price))
    const bestPriceProduct = products.find(p => p.price === minPrice)
    if (bestPriceProduct) best['price'] = bestPriceProduct._id

    // Highest rating is best
    const maxRating = Math.max(...products.map(p => p.rating?.average || 0))
    if (maxRating > 0) {
      const bestRatingProduct = products.find(p => (p.rating?.average || 0) === maxRating)
      if (bestRatingProduct) best['rating'] = bestRatingProduct._id
    }

    // More stock is better
    const maxStock = Math.max(...products.map(p => p.stock))
    const bestStockProduct = products.find(p => p.stock === maxStock)
    if (bestStockProduct && maxStock > 0) best['stock'] = bestStockProduct._id

    return best
  }, [products])

  const shouldShowRow = (key: string) => {
    if (!showOnlyDifferences) return true
    return hasDifference[key] === true
  }

  const handleRemove = (productId: string) => {
    if (comparison) {
      removeFromComparison(comparison.categoryId, productId)
      toast.success('Товар видалено з порівняння')
    }
  }

  const handleClear = () => {
    if (comparison && confirm('Ви впевнені, що хочете очистити список порівняння?')) {
      clearComparison(comparison.categoryId)
      toast.success('Список порівняння очищено')
      router.push('/products')
    }
  }

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return
    addItem(product, 1)
    toast.success('Товар додано до кошика')
  }

  const getCellHighlightClass = (key: string, productId: string) => {
    if (!highlightBest || products.length < 2) return ''
    if (bestValues[key] === productId) {
      return 'bg-green-50 dark:bg-green-950/30'
    }
    return ''
  }

  // ===== EMPTY STATE =====
  if (!comparison || products.length === 0) {
    return (
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Порівняння порожнє</h1>
          <p className="text-muted-foreground mb-8">
            Додайте товари для порівняння характеристик.
            <br />
            Натисніть іконку <span className="inline-flex items-center"><BarChart3 className="h-4 w-4 mx-1" /></span> на картці товару.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition font-medium"
          >
            <ShoppingCart className="h-5 w-5" />
            Перейти до каталогу
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container-custom py-6 sm:py-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">Порівняння товарів</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {comparison.categoryName} — {products.length} {products.length === 1 ? 'товар' : products.length < 5 ? 'товари' : 'товарів'}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="self-start sm:self-auto inline-flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 font-medium transition px-3 py-2 rounded-lg hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Очистити все
        </button>
      </div>

      {/* ===== CATEGORY TABS ===== */}
      {comparisons.length > 1 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {comparisons.map(comp => (
            <Link
              key={comp.categoryId}
              href={`/compare?category=${comp.categoryId}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                comp.categoryId === comparison.categoryId
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {comp.categoryName}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/10 dark:bg-white/10">
                {comp.products.length}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* ===== CONTROLS ===== */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${
            showOnlyDifferences
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border hover:bg-muted'
          }`}
        >
          {showOnlyDifferences ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showOnlyDifferences ? 'Всі параметри' : 'Тільки відмінності'}
        </button>
        <button
          onClick={() => setHighlightBest(!highlightBest)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${
            highlightBest
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-card border-border hover:bg-muted'
          }`}
        >
          <Star className="h-4 w-4" />
          {highlightBest ? 'Приховати кращі' : 'Кращі значення'}
        </button>
      </div>

      {/* ===== MOBILE: Card view ===== */}
      <div className="block lg:hidden space-y-6">
        {/* Product cards row */}
        <div className="grid grid-cols-2 gap-3">
          {products.map(product => (
            <motion.div
              key={product._id}
              layout
              className="relative bg-card border rounded-xl p-3 text-center"
            >
              <button
                onClick={() => handleRemove(product._id)}
                className="absolute top-2 right-2 p-1.5 bg-destructive/10 text-destructive rounded-full hover:bg-destructive hover:text-white transition z-10"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="w-20 h-20 mx-auto bg-muted rounded-lg overflow-hidden mb-2">
                {product.images?.[0]?.url ? (
                  <Image src={product.images[0].url} alt={product.name} width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-2xl">📱</div>
                )}
              </div>

              <Link href={`/products/${product.slug}`} className="text-sm font-semibold hover:text-primary transition line-clamp-2 mb-1 block">
                {product.name}
              </Link>

              <div className="text-lg font-bold text-primary mb-2">
                {formatPrice(product.price)}
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full btn-primary text-xs py-2 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {product.stock === 0 ? 'Немає' : 'До кошика'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Mobile specs list */}
        <div className="space-y-3">
          {shouldShowRow('price') && (
            <MobileCompareRow label="Ціна" diffKey="price" hasDiff={hasDifference['price']}>
              {products.map(p => (
                <div key={p._id} className={`flex-1 text-center py-2 rounded-lg ${getCellHighlightClass('price', p._id)}`}>
                  <span className="font-bold">{formatPrice(p.price)}</span>
                  {p.comparePrice && p.comparePrice > p.price && (
                    <div className="text-xs text-muted-foreground line-through">{formatPrice(p.comparePrice)}</div>
                  )}
                </div>
              ))}
            </MobileCompareRow>
          )}

          {shouldShowRow('rating') && (
            <MobileCompareRow label="Рейтинг" diffKey="rating" hasDiff={hasDifference['rating']}>
              {products.map(p => (
                <div key={p._id} className={`flex-1 text-center py-2 rounded-lg ${getCellHighlightClass('rating', p._id)}`}>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{p.rating?.average?.toFixed(1) || '—'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({p.rating?.count || 0} відг.)</span>
                </div>
              ))}
            </MobileCompareRow>
          )}

          {shouldShowRow('stock') && (
            <MobileCompareRow label="Наявність" diffKey="stock" hasDiff={hasDifference['stock']}>
              {products.map(p => (
                <div key={p._id} className={`flex-1 text-center py-2 rounded-lg ${getCellHighlightClass('stock', p._id)}`}>
                  {p.stock > 0 ? (
                    <span className="text-sm text-green-600 font-medium">✓ Є ({p.stock})</span>
                  ) : (
                    <span className="text-sm text-red-500 font-medium">✗ Немає</span>
                  )}
                </div>
              ))}
            </MobileCompareRow>
          )}

          {shouldShowRow('brand') && (
            <MobileCompareRow label="Бренд" diffKey="brand" hasDiff={hasDifference['brand']}>
              {products.map(p => (
                <div key={p._id} className="flex-1 text-center py-2 text-sm">{p.brand || '—'}</div>
              ))}
            </MobileCompareRow>
          )}

          {shouldShowRow('warranty') && (
            <MobileCompareRow label="Гарантія" diffKey="warranty" hasDiff={hasDifference['warranty']}>
              {products.map(p => (
                <div key={p._id} className="flex-1 text-center py-2 text-sm">{p.warranty || '—'}</div>
              ))}
            </MobileCompareRow>
          )}

          {/* Specs */}
          {Array.from(allSpecs.keys()).map(specName => {
            const key = `spec-${specName}`
            if (!shouldShowRow(key)) return null
            return (
              <MobileCompareRow key={specName} label={specName} diffKey={key} hasDiff={hasDifference[key]}>
                {products.map(p => {
                  const spec = p.specifications?.find(s => s.name === specName)
                  return <div key={p._id} className="flex-1 text-center py-2 text-sm">{spec?.value || '—'}</div>
                })}
              </MobileCompareRow>
            )
          })}

          {/* Features */}
          {allFeatures.map(feature => {
            const key = `feature-${feature}`
            if (!shouldShowRow(key)) return null
            return (
              <MobileCompareRow key={feature} label={feature} diffKey={key} hasDiff={hasDifference[key]}>
                {products.map(p => (
                  <div key={p._id} className="flex-1 text-center py-2">
                    {p.features?.includes(feature) ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                    )}
                  </div>
                ))}
              </MobileCompareRow>
            )
          })}
        </div>
      </div>

      {/* ===== DESKTOP: Table view ===== */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2">
              <th className="text-left py-4 px-5 w-52 bg-muted/60 sticky left-0 z-10">
                <span className="text-sm font-medium text-muted-foreground">Параметр</span>
              </th>
              {products.map(product => (
                <th key={product._id} className="py-4 px-4 min-w-[220px] max-w-[260px]">
                  <div className="relative">
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="absolute -top-1 -right-1 p-1.5 bg-destructive/10 text-destructive rounded-full hover:bg-destructive hover:text-white transition z-10"
                      title="Видалити з порівняння"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="w-36 h-36 mx-auto bg-muted/50 rounded-xl overflow-hidden mb-3 group">
                      {product.images?.[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={144}
                          height={144}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-4xl">📱</div>
                      )}
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="font-semibold hover:text-primary transition line-clamp-2 mb-2 block text-sm"
                    >
                      {product.name}
                      <ExternalLink className="h-3 w-3 inline-block ml-1 opacity-0 group-hover:opacity-100" />
                    </Link>

                    <div className="flex items-baseline justify-center gap-2 mb-3">
                      <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full btn-primary text-sm py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.stock === 0 ? 'Немає в наявності' : 'Додати до кошика'}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Rating */}
            {shouldShowRow('rating') && (
              <tr className={`border-b transition-colors ${hasDifference['rating'] ? '' : 'opacity-70'}`}>
                <td className="py-3.5 px-5 font-medium text-sm bg-muted/60 sticky left-0">
                  Рейтинг
                  {hasDifference['rating'] && <DiffDot />}
                </td>
                {products.map(product => (
                  <td key={product._id} className={`py-3.5 px-4 text-center ${getCellHighlightClass('rating', product._id)}`}>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(product.rating?.average || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm">{product.rating?.average?.toFixed(1) || '—'}</span>
                      <span className="text-xs text-muted-foreground">({product.rating?.count || 0})</span>
                    </div>
                  </td>
                ))}
              </tr>
            )}

            {/* Stock */}
            {shouldShowRow('stock') && (
              <tr className={`border-b transition-colors ${hasDifference['stock'] ? '' : 'opacity-70'}`}>
                <td className="py-3.5 px-5 font-medium text-sm bg-muted/60 sticky left-0">
                  Наявність
                  {hasDifference['stock'] && <DiffDot />}
                </td>
                {products.map(product => (
                  <td key={product._id} className={`py-3.5 px-4 text-center ${getCellHighlightClass('stock', product._id)}`}>
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        В наявності ({product.stock} шт.)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-500 font-medium text-sm">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        Немає в наявності
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            )}

            {/* Brand */}
            {shouldShowRow('brand') && (
              <tr className={`border-b transition-colors ${hasDifference['brand'] ? '' : 'opacity-70'}`}>
                <td className="py-3.5 px-5 font-medium text-sm bg-muted/60 sticky left-0">
                  Бренд
                  {hasDifference['brand'] && <DiffDot />}
                </td>
                {products.map(product => (
                  <td key={product._id} className="py-3.5 px-4 text-center text-sm">
                    {product.brand ? (
                      <span className="font-medium">{product.brand}</span>
                    ) : '—'}
                  </td>
                ))}
              </tr>
            )}

            {/* Warranty */}
            {shouldShowRow('warranty') && (
              <tr className={`border-b transition-colors ${hasDifference['warranty'] ? '' : 'opacity-70'}`}>
                <td className="py-3.5 px-5 font-medium text-sm bg-muted/60 sticky left-0">
                  Гарантія
                  {hasDifference['warranty'] && <DiffDot />}
                </td>
                {products.map(product => (
                  <td key={product._id} className="py-3.5 px-4 text-center text-sm">
                    {product.warranty || '—'}
                  </td>
                ))}
              </tr>
            )}

            {/* Specifications section header */}
            {allSpecs.size > 0 && (
              <tr className="bg-muted/30">
                <td colSpan={products.length + 1} className="py-2 px-5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Характеристики
                  </span>
                </td>
              </tr>
            )}

            {/* Specifications */}
            {Array.from(allSpecs.keys()).map(specName => {
              const key = `spec-${specName}`
              if (!shouldShowRow(key)) return null
              return (
                <tr key={specName} className={`border-b transition-colors hover:bg-muted/20 ${hasDifference[key] ? '' : 'opacity-70'}`}>
                  <td className="py-3.5 px-5 font-medium text-sm bg-muted/60 sticky left-0">
                    {specName}
                    {hasDifference[key] && <DiffDot />}
                  </td>
                  {products.map(product => {
                    const spec = product.specifications?.find(s => s.name === specName)
                    return (
                      <td key={product._id} className={`py-3.5 px-4 text-center text-sm ${hasDifference[key] ? 'font-medium' : ''}`}>
                        {spec?.value || '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {/* Features section header */}
            {allFeatures.length > 0 && (
              <tr className="bg-muted/30">
                <td colSpan={products.length + 1} className="py-2 px-5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Особливості
                  </span>
                </td>
              </tr>
            )}

            {/* Features */}
            {allFeatures.map(feature => {
              const key = `feature-${feature}`
              if (!shouldShowRow(key)) return null
              return (
                <tr key={feature} className={`border-b transition-colors hover:bg-muted/20 ${hasDifference[key] ? '' : 'opacity-70'}`}>
                  <td className="py-3.5 px-5 font-medium text-sm bg-muted/60 sticky left-0">
                    {feature}
                    {hasDifference[key] && <DiffDot />}
                  </td>
                  {products.map(product => (
                    <td key={product._id} className="py-3.5 px-4 text-center">
                      {product.features?.includes(feature) ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* No differences message */}
        {showOnlyDifferences && !Object.values(hasDifference).some(v => v) && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Всі параметри однакові</p>
            <p className="text-sm mt-1">Ці товари мають ідентичні характеристики</p>
          </div>
        )}
      </div>

      {/* ===== LEGEND ===== */}
      {highlightBest && products.length >= 2 && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-800" />
            Краще значення
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-orange-400 rounded-full" />
            Є відмінність
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Helper Components =====

function DiffDot() {
  return <span className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full ml-1.5 align-middle" />
}

function MobileCompareRow({
  label,
  diffKey,
  hasDiff,
  children,
}: {
  label: string
  diffKey: string
  hasDiff: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-lg border p-3 ${hasDiff ? 'border-orange-200 dark:border-orange-800/50' : ''}`}>
      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        {label}
        {hasDiff && <DiffDot />}
      </div>
      <div className="flex gap-2">
        {children}
      </div>
    </div>
  )
}

function ComparisonLoading() {
  return (
    <div className="container-custom py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-4 bg-muted rounded w-1/3"></div>
        <div className="h-64 bg-muted rounded-xl mt-6"></div>
      </div>
    </div>
  )
}

export default function ComparisonPage() {
  return (
    <Suspense fallback={<ComparisonLoading />}>
      <ComparisonContent />
    </Suspense>
  )
}
