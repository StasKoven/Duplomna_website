import { create } from 'zustand'
import api from '@/lib/api'

export interface Notification {
  _id: string
  type: 'order_status' | 'promotion' | 'loyalty' | 'return_status' | 'system'
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true })
      const { data } = await api.get('/notifications')
      set({
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count')
      set({ unreadCount: data.unreadCount || 0 })
    } catch {
      // silent
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all')
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
    } catch {
      // silent
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      const n = get().notifications.find((n) => n._id === id)
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: n && !n.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }))
    } catch {
      // silent
    }
  },
}))
