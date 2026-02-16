'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Search,
  Filter,
  ChevronLeft,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  User,
  Mail,
  Calendar,
  Tag,
  ArrowLeft,
  Inbox,
  Trash2,
} from 'lucide-react'

interface Message {
  _id: string
  sender: 'user' | 'admin' | 'system'
  text: string
  createdAt: string
  senderName?: string
}

interface TicketUser {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface Ticket {
  _id: string
  user?: TicketUser
  guestName?: string
  guestEmail?: string
  subject: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  category: string
  messages: Message[]
  isRead: boolean
  isReadByUser: boolean
  lastMessageAt: string
  createdAt: string
}

const statusOptions = [
  { value: '', label: 'Всі статуси' },
  { value: 'open', label: 'Відкриті' },
  { value: 'in-progress', label: 'В обробці' },
  { value: 'resolved', label: 'Вирішені' },
  { value: 'closed', label: 'Закриті' },
]

const priorityOptions = [
  { value: 'low', label: 'Низький', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { value: 'medium', label: 'Середній', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'high', label: 'Високий', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
]

const categoryLabels: Record<string, string> = {
  order: 'Замовлення',
  delivery: 'Доставка',
  payment: 'Оплата',
  product: 'Товар',
  return: 'Повернення',
  account: 'Акаунт',
  other: 'Інше',
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin/tickets')
    } else if (user?.role !== 'admin') {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  const fetchTickets = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = { page, limit: 20 }
      if (statusFilter) params.status = statusFilter
      if (searchTerm) params.search = searchTerm
      const { data } = await api.get('/tickets/admin/all', { params })
      setTickets(data.tickets || [])
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
    } catch {
      toast.error('Не вдалося завантажити тікети')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchTerm])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchTickets()
    }
  }, [isAuthenticated, user, fetchTickets])

  const handleSelectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket)
    // Mark as read
    if (!ticket.isRead) {
      try {
        await api.put(`/tickets/${ticket._id}/read`)
        setTickets((prev) =>
          prev.map((t) => (t._id === ticket._id ? { ...t, isRead: true } : t))
        )
      } catch {
        // silent
      }
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return
    setSending(true)
    try {
      const { data } = await api.post(`/tickets/${selectedTicket._id}/messages`, {
        message: replyText,
      })
      setSelectedTicket(data.ticket)
      setReplyText('')
      // Update ticket in list
      setTickets((prev) =>
        prev.map((t) => (t._id === data.ticket._id ? data.ticket : t))
      )
      toast.success('Відповідь надіслано')
    } catch {
      toast.error('Не вдалося надіслати відповідь')
    } finally {
      setSending(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return
    try {
      const { data } = await api.put(`/tickets/${selectedTicket._id}/status`, { status })
      setSelectedTicket(data.ticket)
      setTickets((prev) =>
        prev.map((t) => (t._id === data.ticket._id ? data.ticket : t))
      )
      toast.success('Статус оновлено')
    } catch {
      toast.error('Не вдалося оновити статус')
    }
  }

  const handleUpdatePriority = async (priority: string) => {
    if (!selectedTicket) return
    try {
      const { data } = await api.put(`/tickets/${selectedTicket._id}/status`, { priority })
      setSelectedTicket(data.ticket)
      setTickets((prev) =>
        prev.map((t) => (t._id === data.ticket._id ? data.ticket : t))
      )
    } catch {
      toast.error('Не вдалося оновити пріоритет')
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це звернення?')) return
    try {
      await api.delete(`/tickets/${ticketId}`)
      setTickets((prev) => prev.filter((t) => t._id !== ticketId))
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(null)
      }
      toast.success('Звернення видалено')
    } catch {
      toast.error('Не вдалося видалити звернення')
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string; label: string; icon: typeof Clock }> = {
      open: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Відкритий', icon: AlertCircle },
      'in-progress': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'В обробці', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Вирішено', icon: CheckCircle2 },
      closed: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', label: 'Закритий', icon: XCircle },
    }
    const badge = map[status] || map.open
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    )
  }

  const getTicketAuthor = (ticket: Ticket) => {
    if (ticket.user) {
      return `${ticket.user.firstName} ${ticket.user.lastName}`
    }
    return ticket.guestName || 'Гість'
  }

  const getTicketEmail = (ticket: Ticket) => {
    return ticket.user?.email || ticket.guestEmail || ''
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const unreadCount = tickets.filter((t) => !t.isRead).length

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/admin')}
          className="p-2 hover:bg-muted rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            Підтримка
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2.5 py-0.5 rounded-full">
                {unreadCount} нових
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {pagination.total} звернень загалом
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
              placeholder="Пошук за темою, email..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition ${
              showFilters ? 'bg-primary text-white' : 'hover:bg-muted'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Фільтри</span>
          </button>
          <button
            onClick={() => fetchTickets()}
            className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition"
          >
            Пошук
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Статус
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[400px_1fr] gap-6 min-h-[600px]">
        {/* Tickets List */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">
              Звернення ({pagination.total})
            </h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '550px' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Звернень не знайдено</p>
              </div>
            ) : (
              <div className="divide-y">
                {tickets.map((ticket) => (
                  <button
                    key={ticket._id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition ${
                      selectedTicket?._id === ticket._id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    } ${!ticket.isRead ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {!ticket.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                        <span className={`text-sm truncate ${!ticket.isRead ? 'font-bold' : 'font-medium'}`}>
                          {ticket.subject}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {getStatusBadge(ticket.status)}
                      <span className="text-xs text-muted-foreground">
                        {categoryLabels[ticket.category] || ticket.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground truncate">
                        {getTicketAuthor(ticket)}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDate(ticket.lastMessageAt || ticket.createdAt)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-3 border-t flex items-center justify-between">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchTickets(pagination.page - 1)}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition"
              >
                ← Назад
              </button>
              <span className="text-xs text-muted-foreground">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchTickets(pagination.page + 1)}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition"
              >
                Далі →
              </button>
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div className="border rounded-xl overflow-hidden bg-card flex flex-col">
          {!selectedTicket ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Оберіть звернення зі списку
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket Header */}
              <div className="p-4 border-b space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-lg truncate">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {getTicketAuthor(selectedTicket)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {getTicketEmail(selectedTicket)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(selectedTicket.createdAt)}
                      <span>·</span>
                      <Tag className="h-3.5 w-3.5" />
                      {categoryLabels[selectedTicket.category] || selectedTicket.category}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Видалити"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Status & Priority Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Статус:</span>
                    <div className="flex gap-1">
                      {['open', 'in-progress', 'resolved', 'closed'].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(s)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition ${
                            selectedTicket.status === s
                              ? 'bg-primary text-white border-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {{ open: 'Відкритий', 'in-progress': 'В обробці', resolved: 'Вирішено', closed: 'Закритий' }[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Пріоритет:</span>
                    <div className="flex gap-1">
                      {priorityOptions.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => handleUpdatePriority(p.value)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition ${
                            selectedTicket.priority === p.value
                              ? p.color + ' border-current'
                              : 'hover:bg-muted'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '350px' }}>
                {selectedTicket.messages?.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'system' ? (
                      <div className="text-center w-full">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                          {msg.text}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          msg.sender === 'admin'
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {msg.sender === 'admin'
                              ? msg.senderName || 'Адмін'
                              : getTicketAuthor(selectedTicket)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.sender === 'admin' ? 'text-white/60' : 'text-muted-foreground'
                          }`}
                        >
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="border-t p-4">
                <div className="flex gap-3 items-end">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendReply()
                      }
                    }}
                    rows={2}
                    className="flex-1 border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Написати відповідь..."
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2 font-medium text-sm"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Надіслати
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
