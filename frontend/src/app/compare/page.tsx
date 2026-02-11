'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { X, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useComparisonStore } from '@/store/comparisonStore'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'sonner'

function ComparisonContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category')
  
  const { comparisons, removeFromComparison, clearComparison } = useComparisonStore()
  const { addItem } = useCartStore()
  
  const comparison = categoryId 
    ? comparisons.find(c => c.categoryId === categoryId)
    : comparisons[0]

  useEffect(() => {
    if (!comparison && comparisons.length > 0) {
      router.push(`/compare?category=${comparisons[0].categoryId}`)
    }
  }, [comparison, comparisons, router])

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

  const handleAddToCart = (product: any) => {
    addItem(product, 1)
    toast.success('Товар додано до кошика')
  }

  if (!comparison || comparison.products.length === 0) {
    return (
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="text-6xl mb-6">⚖️</div>
          <h1 className="text-3xl font-bold mb-4">Порівняння порожнє</h1>
          <p className="text-muted-foreground mb-8">
            Додайте товари для порівняння характеристик
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition"
          >
            Перейти до каталогу
          </Link>
        </motion.div>
      </div>
    )
  }

  const products = comparison.products
  const allSpecs = new Set<string>()
  products.forEach(product => {
    product.specifications?.forEach(spec => allSpecs.add(spec.name))
  })

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Порівняння товарів</h1>
          <p className="text-muted-foreground">
            {comparison.categoryName} • {products.length} {products.length === 1 ? 'товар' : 'товарів'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
          <button
            onClick={handleClear}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Очистити все
          </button>
        </div>
      </div>

      {comparisons.length > 1 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {comparisons.map(comp => (
            <Link
              key={comp.categoryId}
              href={`/compare?category=${comp.categoryId}`}
              className={`px-4 py-2 rounded-md transition ${
                comp.categoryId === comparison.categoryId
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {comp.categoryName} ({comp.products.length})
            </Link>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Product Images and Names */}
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4 w-48 bg-muted/50"></th>
              {products.map(product => (
                <th key={product._id} className="py-4 px-4 min-w-[200px] max-w-[220px]">
                  <div className="relative">
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="w-32 h-32 mx-auto bg-muted rounded-lg overflow-hidden mb-3">
                      {product.images && product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-3xl">
                          📱
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-semibold hover:text-primary transition line-clamp-2 mb-2 block"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xl font-bold text-primary mb-3">
                      {product.price.toLocaleString('uk-UA')} ₴
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full btn-primary text-sm disabled:opacity-50"
                    >
                      До кошика
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Rating */}
            <tr className="border-b hover:bg-muted/30">
              <td className="py-3 px-4 font-medium bg-muted/50">Рейтинг</td>
              {products.map(product => (
                <td key={product._id} className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span>{product.rating?.average?.toFixed(1) || 'N/A'}</span>
                    <span className="text-sm text-muted-foreground">
                      ({product.rating?.count || 0})
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Stock Status */}
            <tr className="border-b hover:bg-muted/30">
              <td className="py-3 px-4 font-medium bg-muted/50">Наявність</td>
              {products.map(product => (
                <td key={product._id} className="py-3 px-4 text-center">
                  {product.stock > 0 ? (
                    <span className="text-green-600">В наявності ({product.stock})</span>
                  ) : (
                    <span className="text-red-600">Немає в наявності</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Brand */}
            <tr className="border-b hover:bg-muted/30">
              <td className="py-3 px-4 font-medium bg-muted/50">Бренд</td>
              {products.map(product => (
                <td key={product._id} className="py-3 px-4 text-center">
                  {product.brand || '-'}
                </td>
              ))}
            </tr>

            {/* Warranty */}
            <tr className="border-b hover:bg-muted/30">
              <td className="py-3 px-4 font-medium bg-muted/50">Гарантія</td>
              {products.map(product => (
                <td key={product._id} className="py-3 px-4 text-center">
                  {product.warranty || '-'}
                </td>
              ))}
            </tr>

            {/* Specifications */}
            {Array.from(allSpecs).map(specName => (
              <tr key={specName} className="border-b hover:bg-muted/30">
                <td className="py-3 px-4 font-medium bg-muted/50">{specName}</td>
                {products.map(product => {
                  const spec = product.specifications?.find(s => s.name === specName)
                  return (
                    <td key={product._id} className="py-3 px-4 text-center">
                      {spec?.value || '-'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ComparisonLoading() {
  return (
    <div className="container-custom py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
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
