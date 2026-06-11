'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { Category } from '@/types'
import s from './Categories.module.css'

const COMPONENT_MAX_RETRIES = 2
const COMPONENT_RETRY_DELAY = 800
const COMPONENT_TOTAL_TIMEOUT_MS = 5000

type Props = { initialCategories?: Category[] }

export default function Categories({ initialCategories }: Props) {
  // Only trust server data when it actually contains categories. If the SSR
  // fetch failed/timed out (empty array), fall back to a client fetch instead
  // of silently rendering nothing — otherwise the whole section disappears on
  // deployments where the server can't reach the API.
  const hasServerData = (initialCategories?.length ?? 0) > 0
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? [])
  const [loading, setLoading] = useState(!hasServerData)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (hasServerData) return  // Server already provided categories

    cancelledRef.current = false

    const hardTimeout = setTimeout(() => {
      if (!cancelledRef.current) {
        cancelledRef.current = true
        setLoading(false)
      }
    }, COMPONENT_TOTAL_TIMEOUT_MS)

    const fetchCategories = async (attempt = 0) => {
      try {
        const response = await api.get('/categories')
        if (cancelledRef.current) return
        const incoming = response.data?.categories
        if (Array.isArray(incoming) && incoming.length) {
          setCategories(incoming.slice(0, 6))
        } else {
          setCategories([])
        }
        setLoading(false)
      } catch (error: any) {
        if (cancelledRef.current) return
        console.error('Error fetching categories:', error)
        const isNetworkError = !error.response
        // Only retry on timeouts — ECONNREFUSED is immediate and won't self-heal in 800ms.
        const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED'
        if (isNetworkError && isTimeout && attempt < COMPONENT_MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, COMPONENT_RETRY_DELAY))
          if (!cancelledRef.current) {
            return fetchCategories(attempt + 1)
          }
        } else {
          setLoading(false)
        }
      }
    }

    fetchCategories()

    return () => {
      cancelledRef.current = true
      clearTimeout(hardTimeout)
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Стан завантаження (скелетон) — тільки якщо немає серверних даних
  if (loading) {
    return (
      <section className={s.section}>
        <div className={`container-custom ${s.container}`}>
          <div className={s.header}>
            <div>
              <h2 className={s.title}>Категорії</h2>
              <p className={s.subtitle}>Оберіть те, що вам потрібно</p>
            </div>
          </div>
          <div className={s.gridLayout}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={s.skeleton} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!categories.length) return null

  return (
    <section className={s.section}>
      <div className={`container-custom ${s.container}`}>
        {/* Заголовок секції */}
        <div className={s.header}>
          <div>
            <h2 className={s.title}>Категорії</h2>
            <p className={s.subtitle}>Оберіть те, що вам потрібно</p>
          </div>
          <Link href="/categories" className={s.viewAllLink}>
            Дивитись всі
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Сітка категорій з CSS-анімацією */}
        <div className={s.gridLayout}>
          {categories.map((category, i) => (
            <div
              key={category._id}
              className={s.categoryItem}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <Link
                href={`/products?category=${category._id}`}
                className={`group ${s.categoryLink}`}
              >
                {/* Картка категорії — назва та стрілка поверх */}
                <div className={s.card}>
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 480px) 50vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className={s.cardImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={s.emojiContainer}>
                      {getCategoryEmoji(category.name)}
                    </div>
                  )}
                  <div className={s.overlay} />
                  <span className={s.arrowBadge}>
                    <ArrowRight className={s.arrowBadgeIcon} />
                  </span>
                  <h3 className={s.categoryName}>
                    {category.name}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Мобільне посилання "Дивитись всі" */}
        <div className={s.mobileViewAll}>
          <Link href="/categories" className={s.mobileViewAllLink}>
            Дивитись всі категорії
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function getCategoryEmoji(name: string): string {
  // Match by lowercase keyword so both English and Ukrainian category names get
  // a fitting icon (Tile fallback when no image is set).
  const lower = (name || '').toLowerCase()
  const map: Array<[RegExp, string]> = [
    [/смартфон|phone|телефон/i, '📱'],
    [/ноутбук|laptop|macbook/i, '💻'],
    [/планшет|tablet|ipad/i, '📲'],
    [/годинник|watch/i, '⌚'],
    [/навушник|headphone|airpods/i, '🎧'],
    [/камер|camera|фотоапарат/i, '📷'],
    [/консол|console|xbox|playstation|gaming/i, '🎮'],
    [/телевізор|tv|монітор|monitor/i, '🖥️'],
    [/аксесуар|accessor|зарядк|кабел/i, '🔌'],
    [/розумн|smart\s*home/i, '🏠'],
    [/самокат|scooter/i, '🛴'],
  ]
  for (const [re, emoji] of map) {
    if (re.test(lower)) return emoji
  }
  return '📦'
}
