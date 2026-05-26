'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, Trash2, Package, Tag, Star, Info } from 'lucide-react'
import { useNotificationStore, Notification } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import s from './NotificationBell.module.css'

const TYPE_ICONS: Record<Notification['type'], React.ReactNode> = {
  order_status: <Package className={s.typeIcon} />,
  promotion: <Tag className={s.typeIcon} />,
  loyalty: <Star className={s.typeIcon} />,
  return_status: <Package className={s.typeIcon} />,
  system: <Info className={s.typeIcon} />,
}

export default function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { isAuthenticated } = useAuthStore()
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !isAuthenticated) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30_000)
    return () => clearInterval(interval)
  }, [mounted, isAuthenticated])

  useEffect(() => {
    if (open && isAuthenticated) {
      fetchNotifications()
    }
  }, [open, isAuthenticated])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!mounted || !isAuthenticated) return null

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) await markAsRead(n._id)
    if (n.link) {
      router.push(n.link)
      setOpen(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'щойно'
    if (mins < 60) return `${mins} хв`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} год`
    const days = Math.floor(hours / 24)
    return `${days} дн`
  }

  return (
    <div className={s.wrapper} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={s.bellBtn}
        aria-label="Сповіщення"
      >
        <Bell className={s.bellIcon} />
        {unreadCount > 0 && (
          <span className={s.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

        {open && (
          <div className={`${s.dropdown} ${s.dropdownEnter}`}>
            <div className={s.dropdownHeader}>
              <span className={s.dropdownTitle}>Сповіщення</span>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className={s.markAllBtn}>
                  <CheckCheck className={s.markAllIcon} />
                  Прочитати все
                </button>
              )}
            </div>

            <div className={s.list}>
              {notifications.length === 0 ? (
                <div className={s.empty}>Немає сповіщень</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`${s.item} ${!n.isRead ? s.itemUnread : ''}`}
                  >
                    <button
                      className={s.itemContent}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className={s.itemIcon}>
                        {TYPE_ICONS[n.type] || <Bell className={s.typeIcon} />}
                      </div>
                      <div className={s.itemText}>
                        <div className={s.itemTitle}>{n.title}</div>
                        <div className={s.itemMessage}>{n.message}</div>
                        <div className={s.itemTime}>{timeAgo(n.createdAt)}</div>
                      </div>
                    </button>
                    <div className={s.itemActions}>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className={s.itemActionBtn}
                          title="Прочитати"
                        >
                          <Check className={s.itemActionIcon} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className={s.itemActionBtn}
                        title="Видалити"
                      >
                        <Trash2 className={s.itemActionIcon} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
    </div>
  )
}
