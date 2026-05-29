'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import s from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={s.skeleton} aria-hidden suppressHydrationWarning />
  }

  const isDark = resolvedTheme === 'dark'
  const next = isDark ? 'light' : 'dark'
  const label = isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={s.toggle}
      aria-label={label}
      title={label}
    >
      <span className={s.glow} aria-hidden />
      <span className={s.iconWrap}>
        <Sun className={`${s.icon} ${s.sun}`} />
        <Moon className={`${s.icon} ${s.moon}`} />
      </span>
    </button>
  )
}
