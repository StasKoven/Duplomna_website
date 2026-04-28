'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hides the new route's content until its CSS module chunks have loaded.
 * Prevents the flash of unstyled content seen during App Router navigation
 * when CSS modules are fetched as separate chunks.
 */
export default function NavigationFOUCGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [ready, setReady] = useState(true)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    let cancelled = false
    setReady(false)

    const waitForStylesheets = async () => {
      const links = Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
      )

      await Promise.all(
        links.map((link) => {
          if (link.sheet) return Promise.resolve()
          return new Promise<void>((resolve) => {
            const done = () => resolve()
            link.addEventListener('load', done, { once: true })
            link.addEventListener('error', done, { once: true })
          })
        })
      )

      if (cancelled) return

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true)
        })
      })
    }

    waitForStylesheets()

    const safety = setTimeout(() => {
      if (!cancelled) setReady(true)
    }, 600)

    return () => {
      cancelled = true
      clearTimeout(safety)
    }
  }, [pathname])

  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        transition: ready ? 'opacity 120ms ease-out' : 'none',
      }}
    >
      {children}
    </div>
  )
}
