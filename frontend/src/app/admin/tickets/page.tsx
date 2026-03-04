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
import s from './page.module.css'

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
  { value: 'low', label: 'Низький' },
  { value: 'medium', label: 'Середній' },
  { value: 'high', label: 'Високий' },
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
    const map: Record<string, { className: string; label: string; icon: typeof Clock }> = {
      open: { className: s.statusOpen, label: 'Відкритий', icon: AlertCircle },
      'in-progress': { className: s.statusInProgress, label: 'В обробці', icon: Clock },
      resolved: { className: s.statusResolved, label: 'Вирішено', icon: CheckCircle2 },
      closed: { className: s.statusClosed, label: 'Закритий', icon: XCircle },
    }
    const badge = map[status] || map.open
    const Icon = badge.icon
    return (
      <span className={`${s.statusBadge} ${badge.className}`}>
        <Icon className={s.badgeIcon} />
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
    <div className={`container-custom ${s.page}`}>
      {/* Header */}
      <div className={s.header}>
        <button
          onClick={() => router.push('/admin')}
          className={s.backButton}
        >
          <ArrowLeft className={s.backIcon} />
        </button>
        <div className={s.headerContent}>
          <h1 className={s.title}>
            <MessageSquare className={s.titleIcon} />
            Підтримка
            {unreadCount > 0 && (
              <span className={s.unreadBadge}>
                {unreadCount} нових
              </span>
            )}
          </h1>
          <p className={s.subtitle}>
            {pagination.total} звернень загалом
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className={s.filtersSection}>
        <div className={s.searchRow}>
          <div className={s.searchInputWrapper}>
            <Search className={s.searchIcon} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
              placeholder="Пошук за темою, email..."
              className={s.searchInput}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? s.filterButtonActive : s.filterButton}
          >
            <Filter className={s.filterBtnIcon} />
            <span className={s.filterBtnText}>Фільтри</span>
          </button>
          <button
            onClick={() => fetchTickets()}
            className={s.searchButton}
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
              className={s.filtersAnimated}
            >
              <div className={s.filtersContent}>
                <div>
                  <label className={s.filterLabel}>
                    Статус
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={s.filterSelect}
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
      <div className={s.mainGrid}>
        {/* Tickets List */}
        <div className={s.ticketList}>
          <div className={s.ticketListHeader}>
            <h3 className={s.ticketListTitle}>
              Звернення ({pagination.total})
            </h3>
          </div>
          <div className={s.ticketListScroll} style={{ maxHeight: '550px' }}>
            {loading ? (
              <div className={s.loadingCenter}>
                <Loader2 className={s.spinnerIcon} />
              </div>
            ) : tickets.length === 0 ? (
              <div className={s.emptyState}>
                <Inbox className={s.emptyIcon} />
                <p className={s.emptyText}>Звернень не знайдено</p>
              </div>
            ) : (
              <div className={s.divideY}>
                {tickets.map((ticket) => (
                  <button
                    key={ticket._id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`${s.ticketItem} ${
                      selectedTicket?._id === ticket._id ? s.ticketItemSelected : ''
                    } ${!ticket.isRead ? s.ticketItemUnread : ''}`}
                  >
                    <div className={s.ticketItemTop}>
                      <div className={s.ticketItemLeft}>
                        {!ticket.isRead && (
                          <span className={s.unreadDot} />
                        )}
                        <span className={!ticket.isRead ? s.ticketSubjectUnread : s.ticketSubject}>
                          {ticket.subject}
                        </span>
                      </div>
                    </div>
                    <div className={s.ticketMeta}>
                      {getStatusBadge(ticket.status)}
                      <span className={s.ticketCategory}>
                        {categoryLabels[ticket.category] || ticket.category}
                      </span>
                    </div>
                    <div className={s.ticketFooter}>
                      <span className={s.ticketAuthor}>
                        {getTicketAuthor(ticket)}
                      </span>
                      <span className={s.ticketDate}>
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
            <div className={s.pagination}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchTickets(pagination.page - 1)}
                className={s.pageBtn}
              >
                ← Назад
              </button>
              <span className={s.pageInfo}>
                {pagination.page} / {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchTickets(pagination.page + 1)}
                className={s.pageBtn}
              >
                Далі →
              </button>
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <div className={s.detailPanel}>
          {!selectedTicket ? (
            <div className={s.detailEmpty}>
              <div className={s.detailEmptyInner}>
                <MessageSquare className={s.detailEmptyIcon} />
                <p className={s.detailEmptyText}>
                  Оберіть звернення зі списку
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket Header */}
              <div className={s.detailHeader}>
                <div className={s.detailHeaderTop}>
                  <div className={s.detailHeaderLeft}>
                    <h2 className={s.detailTitle}>{selectedTicket.subject}</h2>
                    <div className={s.detailMeta}>
                      <span className={s.metaItem}>
                        <User className={s.metaIcon} />
                        {getTicketAuthor(selectedTicket)}
                      </span>
                      <span className={s.metaItem}>
                        <Mail className={s.metaIcon} />
                        {getTicketEmail(selectedTicket)}
                      </span>
                    </div>
                    <div className={s.detailSubMeta}>
                      <Calendar className={s.metaIcon} />
                      {formatDate(selectedTicket.createdAt)}
                      <span>·</span>
                      <Tag className={s.metaIcon} />
                      {categoryLabels[selectedTicket.category] || selectedTicket.category}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket._id)}
                    className={s.deleteBtn}
                    title="Видалити"
                  >
                    <Trash2 className={s.deleteBtnIcon} />
                  </button>
                </div>

                {/* Status & Priority Controls */}
                <div className={s.controlsRow}>
                  <div className={s.controlGroup}>
                    <span className={s.controlLabel}>Статус:</span>
                    <div className={s.controlBtns}>
                      {['open', 'in-progress', 'resolved', 'closed'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(st)}
                          className={selectedTicket.status === st ? s.statusBtnActive : s.statusBtn}
                        >
                          {{ open: 'Відкритий', 'in-progress': 'В обробці', resolved: 'Вирішено', closed: 'Закритий' }[st]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={s.controlGroup}>
                    <span className={s.controlLabel}>Пріоритет:</span>
                    <div className={s.controlBtns}>
                      {priorityOptions.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => handleUpdatePriority(p.value)}
                          className={`${s.priorityBtn} ${
                            selectedTicket.priority === p.value
                              ? { low: s.priorityActiveLow, medium: s.priorityActiveMedium, high: s.priorityActiveHigh }[p.value]
                              : ''
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
              <div className={s.messagesArea} style={{ maxHeight: '350px' }}>
                {selectedTicket.messages?.map((msg) => (
                  <div
                    key={msg._id}
                    className={msg.sender === 'admin' ? s.msgRowAdmin : s.msgRowUser}
                  >
                    {msg.sender === 'system' ? (
                      <div className={s.systemMsg}>
                        <span className={s.systemMsgText}>
                          {msg.text}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={msg.sender === 'admin' ? s.bubbleAdmin : s.bubbleUser}
                      >
                        <div className={s.msgSender}>
                          <User className={s.msgSenderIcon} />
                          <span className={s.msgSenderName}>
                            {msg.sender === 'admin'
                              ? msg.senderName || 'Адмін'
                              : getTicketAuthor(selectedTicket)}
                          </span>
                        </div>
                        <p className={s.msgText}>{msg.text}</p>
                        <p
                          className={msg.sender === 'admin' ? s.msgTimeAdmin : s.msgTimeUser}
                        >
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className={s.replySection}>
                <div className={s.replyRow}>
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
                    className={s.replyTextarea}
                    placeholder="Написати відповідь..."
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className={s.sendBtn}
                  >
                    {sending ? (
                      <Loader2 className={s.sendBtnSpinner} />
                    ) : (
                      <Send className={s.sendBtnIcon} />
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
