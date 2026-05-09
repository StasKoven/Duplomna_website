'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { X, ArrowLeft, ShoppingCart, Eye, EyeOff, Star, Check, Minus, BarChart3, Trash2, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useComparisonStore } from '@/store/comparisonStore'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'
import ProductImagePlaceholder from '@/components/products/ProductImagePlaceholder'
import s from './page.module.css'

function ComparisonContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category')

  const { comparisons, removeFromComparison, clearComparison } = useComparisonStore()
  const { addItem } = useCartStore()

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
        const sp = p.specifications?.find(sp => sp.name === name)
        return sp?.value || '-'
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
    }
  }

  const handleClear = () => {
    if (comparison && confirm('Ви впевнені, що хочете очистити список порівняння?')) {
      clearComparison(comparison.categoryId)
      router.push('/products')
    }
  }

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return
    addItem(product, 1)
  }

  const getCellHighlightClass = (key: string, productId: string) => {
    if (!highlightBest || products.length < 2) return ''
    if (bestValues[key] === productId) {
      return s.cellHighlight
    }
    return ''
  }

  // ===== EMPTY STATE =====
  if (!comparison || products.length === 0) {
    return (
      <div className={`container-custom ${s.emptyPage}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.emptyContent}
        >
          <div className={s.emptyIconWrap}>
            <BarChart3 className={s.emptyIcon} />
          </div>
          <h1 className={s.emptyTitle}>Порівняння порожнє</h1>
          <p className={s.emptyText}>
            Додайте товари для порівняння характеристик.
            <br />
            Натисніть іконку <span className={s.inlineIconWrap}><BarChart3 className={s.inlineIcon} /></span> на картці товару.
          </p>
          <Link
            href="/products"
            className={s.emptyButton}
          >
            <ShoppingCart className={s.emptyButtonIcon} />
            Перейти до каталогу
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`container-custom ${s.page}`}>
      {/* ===== HEADER ===== */}
      <div className={s.header}>
        <div>
          <button
            onClick={() => router.back()}
            className={s.backButton}
          >
            <ArrowLeft className={s.backIcon} />
            Назад
          </button>
          <h1 className={s.title}>Порівняння товарів</h1>
          <p className={s.subtitle}>
            {comparison.categoryName} — {products.length} {products.length === 1 ? 'товар' : products.length < 5 ? 'товари' : 'товарів'}
          </p>
        </div>
        <button
          onClick={handleClear}
          className={s.clearButton}
        >
          <Trash2 className={s.clearIcon} />
          Очистити все
        </button>
      </div>

      {/* ===== CATEGORY TABS ===== */}
      {comparisons.length > 1 && (
        <div className={s.tabs}>
          {comparisons.map(comp => (
            <Link
              key={comp.categoryId}
              href={`/compare?category=${comp.categoryId}`}
              className={`${s.tab} ${
                comp.categoryId === comparison.categoryId
                  ? s.tabActive
                  : s.tabInactive
              }`}
            >
              {comp.categoryName}
              <span className={s.tabBadge}>
                {comp.products.length}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* ===== CONTROLS ===== */}
      <div className={s.controls}>
        <button
          onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
          className={`${s.controlBtn} ${
            showOnlyDifferences
              ? s.controlBtnActive
              : s.controlBtnInactive
          }`}
        >
          {showOnlyDifferences ? <EyeOff className={s.controlIcon} /> : <Eye className={s.controlIcon} />}
          {showOnlyDifferences ? 'Всі параметри' : 'Тільки відмінності'}
        </button>
        <button
          onClick={() => setHighlightBest(!highlightBest)}
          className={`${s.controlBtn} ${
            highlightBest
              ? s.highlightBtnActive
              : s.controlBtnInactive
          }`}
        >
          <Star className={s.controlIcon} />
          {highlightBest ? 'Приховати кращі' : 'Кращі значення'}
        </button>
      </div>

      {/* ===== MOBILE: Card view ===== */}
      <div className={s.mobileView}>
        {/* Product cards row */}
        <div className={s.mobileGrid}>
          {products.map(product => (
            <motion.div
              key={product._id}
              layout
              className={s.mobileCard}
            >
              <button
                onClick={() => handleRemove(product._id)}
                className={s.mobileRemoveBtn}
              >
                <X className={s.removeIconXs} />
              </button>

              <div className={s.mobileImageWrap}>
                {product.images?.[0]?.url ? (
                  <Image src={product.images[0].url} alt={product.name} width={80} height={80} className={s.productImage} />
                ) : (
                  <ProductImagePlaceholder size="sm" />
                )}
              </div>

              <Link href={`/products/${product.slug}`} className={s.mobileProductLink}>
                {product.name}
              </Link>

              <div className={s.mobilePrice}>
                {formatPrice(product.price)}
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className={`btn-primary ${s.mobileCartBtn}`}
              >
                <ShoppingCart className={s.mobileCartIcon} />
                {product.stock === 0 ? 'Немає' : 'До кошика'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Mobile specs list */}
        <div className={s.mobileSpecs}>
          {shouldShowRow('price') && (
            <MobileCompareRow label="Ціна" diffKey="price" hasDiff={hasDifference['price']}>
              {products.map(p => (
                <div key={p._id} className={`${s.mobileCell} ${getCellHighlightClass('price', p._id)}`}>
                  <span className={s.bold}>{formatPrice(p.price)}</span>
                  {p.comparePrice && p.comparePrice > p.price && (
                    <div className={s.oldPrice}>{formatPrice(p.comparePrice)}</div>
                  )}
                </div>
              ))}
            </MobileCompareRow>
          )}

          {shouldShowRow('rating') && (
            <MobileCompareRow label="Рейтинг" diffKey="rating" hasDiff={hasDifference['rating']}>
              {products.map(p => (
                <div key={p._id} className={`${s.mobileCell} ${getCellHighlightClass('rating', p._id)}`}>
                  <div className={s.ratingWrap}>
                    <Star className={s.starFilled} />
                    <span className={s.ratingValue}>{p.rating?.average?.toFixed(1) || '—'}</span>
                  </div>
                  <span className={s.ratingCount}>({p.rating?.count || 0} відг.)</span>
                </div>
              ))}
            </MobileCompareRow>
          )}

          {shouldShowRow('stock') && (
            <MobileCompareRow label="Наявність" diffKey="stock" hasDiff={hasDifference['stock']}>
              {products.map(p => (
                <div key={p._id} className={`${s.mobileCell} ${getCellHighlightClass('stock', p._id)}`}>
                  {p.stock > 0 ? (
                    <span className={s.stockIn}>✓ Є ({p.stock})</span>
                  ) : (
                    <span className={s.stockOut}>✗ Немає</span>
                  )}
                </div>
              ))}
            </MobileCompareRow>
          )}

          {shouldShowRow('brand') && (
            <MobileCompareRow label="Бренд" diffKey="brand" hasDiff={hasDifference['brand']}>
              {products.map(p => (
                <div key={p._id} className={s.mobileCellText}>{p.brand || '—'}</div>
              ))}
            </MobileCompareRow>
          )}

          {shouldShowRow('warranty') && (
            <MobileCompareRow label="Гарантія" diffKey="warranty" hasDiff={hasDifference['warranty']}>
              {products.map(p => (
                <div key={p._id} className={s.mobileCellText}>{p.warranty || '—'}</div>
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
                  const spec = p.specifications?.find(sp => sp.name === specName)
                  return <div key={p._id} className={s.mobileCellText}>{spec?.value || '—'}</div>
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
                  <div key={p._id} className={s.mobileCellFeature}>
                    {p.features?.includes(feature) ? (
                      <Check className={s.checkIcon} />
                    ) : (
                      <Minus className={s.minusIcon} />
                    )}
                  </div>
                ))}
              </MobileCompareRow>
            )
          })}
        </div>
      </div>

      {/* ===== DESKTOP: Table view ===== */}
      <div className={s.desktopView}>
        <table className={s.table}>
          <thead>
            <tr className={s.tableHeadRow}>
              <th className={s.paramHeader}>
                <span className={s.paramLabel}>Параметр</span>
              </th>
              {products.map(product => (
                <th key={product._id} className={s.productHeader} style={{ width: `${100 / (products.length + 1)}%`, minWidth: '200px' }}>
                  <div className={s.productHeaderContent}>
                    <button
                      onClick={() => handleRemove(product._id)}
                      className={s.desktopRemoveBtn}
                      title="Видалити з порівняння"
                    >
                      <X className={s.removeIconXs} />
                    </button>

                    <div className={`${s.desktopImageWrap} group`}>
                      {product.images?.[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={144}
                          height={144}
                          className={s.desktopImage}
                        />
                      ) : (
                        <ProductImagePlaceholder size="md" />
                      )}
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className={s.desktopProductLink}
                    >
                      {product.name}
                      <ExternalLink className={s.externalIcon} />
                    </Link>

                    <div className={s.priceRow}>
                      <span className={s.desktopPrice}>{formatPrice(product.price)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className={s.desktopOldPrice}>{formatPrice(product.comparePrice)}</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`btn-primary ${s.desktopCartBtn}`}
                    >
                      <ShoppingCart className={s.cartIcon} />
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
              <tr className={`${s.tableRow} ${hasDifference['rating'] ? '' : s.dimmed}`}>
                <td className={s.rowLabel}>
                  Рейтинг
                  {hasDifference['rating'] && <DiffDot />}
                </td>
                {products.map(product => (
                  <td key={product._id} className={`${s.rowValue} ${getCellHighlightClass('rating', product._id)}`}>
                    <div className={s.ratingDesktopWrap}>
                      <div className={s.starsWrap}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={
                              star <= Math.round(product.rating?.average || 0)
                                ? s.starFilled
                                : s.starEmpty
                            }
                          />
                        ))}
                      </div>
                      <span className={s.ratingDesktopValue}>{product.rating?.average?.toFixed(1) || '—'}</span>
                      <span className={s.ratingDesktopCount}>({product.rating?.count || 0})</span>
                    </div>
                  </td>
                ))}
              </tr>
            )}

            {/* Stock */}
            {shouldShowRow('stock') && (
              <tr className={`${s.tableRow} ${hasDifference['stock'] ? '' : s.dimmed}`}>
                <td className={s.rowLabel}>
                  Наявність
                  {hasDifference['stock'] && <DiffDot />}
                </td>
                {products.map(product => (
                  <td key={product._id} className={`${s.rowValue} ${getCellHighlightClass('stock', product._id)}`}>
                    {product.stock > 0 ? (
                      <span className={s.stockInDesktop}>
                        <span className={s.stockDotGreen} />
                        В наявності ({product.stock} шт.)
                      </span>
                    ) : (
                      <span className={s.stockOutDesktop}>
                        <span className={s.stockDotRed} />
                        Немає в наявності
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            )}

            {/* Brand */}
            {shouldShowRow('brand') && (
              <tr className={`${s.tableRow} ${hasDifference['brand'] ? '' : s.dimmed}`}>
                <td className={s.rowLabel}>
                  Бренд
                  {hasDifference['brand'] && <DiffDot />}
                </td>
                {products.map(product => (
                  <td key={product._id} className={s.rowValueText}>
                    {product.brand ? (
                      <span className={s.fontMedium}>{product.brand}</span>
                    ) : '—'}
                  </td>
                ))}
              </tr>
            )}

            {/* Warranty */}
            {shouldShowRow('warranty') && (
              <tr className={`${s.tableRow} ${hasDifference['warranty'] ? '' : s.dimmed}`}>
                <td className={s.rowLabel}>
                  Гарантія
                  {hasDifference['warranty'] && <DiffDot />}
                </td>
                {products.map(product => (
                  <td key={product._id} className={s.rowValueText}>
                    {product.warranty || '—'}
                  </td>
                ))}
              </tr>
            )}

            {/* Specifications section header */}
            {allSpecs.size > 0 && (
              <tr className={s.sectionHeaderRow}>
                <td colSpan={products.length + 1} className={s.sectionHeaderCell}>
                  <span className={s.sectionHeaderText}>
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
                <tr key={specName} className={`${s.tableRowHover} ${hasDifference[key] ? '' : s.dimmed}`}>
                  <td className={s.rowLabel}>
                    {specName}
                    {hasDifference[key] && <DiffDot />}
                  </td>
                  {products.map(product => {
                    const spec = product.specifications?.find(sp => sp.name === specName)
                    return (
                      <td key={product._id} className={`${s.rowValueText} ${hasDifference[key] ? s.specValueDiff : ''}`}>
                        {spec?.value || '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}

            {/* Features section header */}
            {allFeatures.length > 0 && (
              <tr className={s.sectionHeaderRow}>
                <td colSpan={products.length + 1} className={s.sectionHeaderCell}>
                  <span className={s.sectionHeaderText}>
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
                <tr key={feature} className={`${s.tableRowHover} ${hasDifference[key] ? '' : s.dimmed}`}>
                  <td className={s.rowLabel}>
                    {feature}
                    {hasDifference[key] && <DiffDot />}
                  </td>
                  {products.map(product => (
                    <td key={product._id} className={s.rowValue}>
                      {product.features?.includes(feature) ? (
                        <Check className={s.checkIcon} />
                      ) : (
                        <Minus className={s.minusIcon} />
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
          <div className={s.noDiffMessage}>
            <p className={s.noDiffTitle}>Всі параметри однакові</p>
            <p className={s.noDiffText}>Ці товари мають ідентичні характеристики</p>
          </div>
        )}
      </div>

      {/* ===== LEGEND ===== */}
      {highlightBest && products.length >= 2 && (
        <div className={s.legend}>
          <div className={s.legendItem}>
            <div className={s.legendGreen} />
            Краще значення
          </div>
          <div className={s.legendItem}>
            <span className={s.legendOrange} />
            Є відмінність
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Helper Components =====

function DiffDot() {
  return <span className={s.diffDot} />
}

function MobileCompareRow({
  label,
  diffKey: _diffKey,
  hasDiff,
  children,
}: {
  label: string
  diffKey?: string
  hasDiff: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`${s.mobileRow} ${hasDiff ? s.mobileRowDiff : ''}`}>
      <div className={s.mobileRowLabel}>
        {label}
        {hasDiff && <DiffDot />}
      </div>
      <div className={s.mobileRowContent}>
        {children}
      </div>
    </div>
  )
}

function ComparisonLoading() {
  return (
    <div className={`container-custom ${s.loadingPage}`}>
      <div className={s.loadingPulse}>
        <div className={s.loadingTitle}></div>
        <div className={s.loadingSubtitle}></div>
        <div className={s.loadingTable}></div>
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
