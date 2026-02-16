'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  ChevronLeft,
  HelpCircle,
  Package,
  Truck,
  CreditCard,
  RotateCcw,
  Shield,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Message {
  _id: string
  sender: 'user' | 'admin' | 'system'
  text: string
  createdAt: string
  senderName?: string
}

interface Ticket {
  _id: string
  subject: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  category: string
  messages: Message[]
  isReadByUser: boolean
  lastMessageAt: string
  createdAt: string
}

const popularQuestions = [
  {
    icon: Package,
    question: 'Як оформити замовлення?',
    answer:
      'Додайте товари до кошика, перейдіть до оформлення замовлення, заповніть дані та оберіть спосіб доставки і оплати.',
  },
  {
    icon: Truck,
    question: 'Скільки коштує доставка?',
    answer:
      'Доставка Новою Поштою від 50 грн. При замовленні від 1000 грн — доставка безкоштовна. Час доставки 1-3 робочих дні.',
  },
  {
    icon: CreditCard,
    question: 'Які способи оплати?',
    answer:
      'Оплата карткою онлайн, готівкою при отриманні, або безготівковий розрахунок для юридичних осіб.',
  },
  {
    icon: RotateCcw,
    question: 'Як повернути товар?',
    answer:
      'Протягом 14 днів можна повернути товар належної якості при збереженні товарного вигляду та упаковки.',
  },
  {
    icon: Shield,
    question: 'Яка гарантія на товари?',
    answer:
      'Смартфони — 12 міс., ноутбуки — 24 міс., аксесуари — 6 міс. Всі товари оригінальні з офіційною гарантією.',
  },
  {
    icon: Clock,
    question: 'Скільки обробляється замовлення?',
    answer:
      'Замовлення обробляється 1-2 робочих дні. Після відправки ви отримаєте трек-номер для відстеження.',
  },
]

const categoryOptions = [
  { value: 'order', label: 'Замовлення' },
  { value: 'delivery', label: 'Доставка' },
  { value: 'payment', label: 'Оплата' },
  { value: 'product', label: 'Товар' },
  { value: 'return', label: 'Повернення' },
  { value: 'account', label: 'Акаунт' },
  { value: 'other', label: 'Інше' },
]

type ChatView = 'main' | 'faq-answer' | 'new-ticket' | 'tickets' | 'ticket-detail'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<ChatView>('main')
  const [selectedFaq, setSelectedFaq] = useState<(typeof popularQuestions)[0] | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    message: '',
    category: 'other',
    guestName: '',
    guestEmail: '',
  })
  const [unreadCount, setUnreadCount] = useState(0)

  const { user, isAuthenticated } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch user tickets
  const fetchTickets = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const { data } = await api.get('/tickets/my')
      setTickets(data.tickets || [])
      const unread = (data.tickets || []).filter((t: Ticket) => !t.isReadByUser).length
      setUnreadCount(unread)
    } catch {
      // silent fail
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchTickets()
    }
  }, [isAuthenticated, isOpen, fetchTickets])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (view === 'ticket-detail') {
      setTimeout(scrollToBottom, 100)
    }
  }, [currentTicket?.messages, view, scrollToBottom])

  const handleOpenFaq = (faq: (typeof popularQuestions)[0]) => {
    setSelectedFaq(faq)
    setView('faq-answer')
  }

  const handleCreateTicket = async () => {
    if (!newTicketData.subject.trim() || !newTicketData.message.trim()) {
      toast.error('Заповніть тему та повідомлення')
      return
    }

    if (!isAuthenticated && (!newTicketData.guestName.trim() || !newTicketData.guestEmail.trim())) {
      toast.error("Вкажіть ваше ім'я та email")
      return
    }

    setIsLoading(true)
    try {
      const payload: Record<string, string> = {
        subject: newTicketData.subject,
        message: newTicketData.message,
        category: newTicketData.category,
      }
      if (!isAuthenticated) {
        payload.guestName = newTicketData.guestName
        payload.guestEmail = newTicketData.guestEmail
      }
      const { data } = await api.post('/tickets', payload)
      toast.success('Звернення створено!')
      setNewTicketData({ subject: '', message: '', category: 'other', guestName: '', guestEmail: '' })
      if (isAuthenticated) {
        await fetchTickets()
        setCurrentTicket(data.ticket)
        setView('ticket-detail')
      } else {
        setView('main')
      }
    } catch {
      toast.error('Не вдалося створити звернення')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentTicket) return
    setIsLoading(true)
    try {
      const { data } = await api.post(`/tickets/${currentTicket._id}/messages`, {
        message: messageText,
      })
      setCurrentTicket(data.ticket)
      setMessageText('')
      inputRef.current?.focus()
    } catch {
      toast.error('Не вдалося надіслати повідомлення')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenTicket = async (ticket: Ticket) => {
    setCurrentTicket(ticket)
    setView('ticket-detail')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleBack = () => {
    switch (view) {
      case 'faq-answer':
      case 'new-ticket':
      case 'tickets':
        setView('main')
        break
      case 'ticket-detail':
        setView('tickets')
        break
      default:
        setView('main')
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      open: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Відкритий' },
      'in-progress': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'В обробці' },
      resolved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Вирішено' },
      closed: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: 'Закритий' },
    }
    const badge = map[status] || map.open
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 1) return 'щойно'
    if (mins < 60) return `${mins} хв тому`
    if (hours < 24) return `${hours} год тому`
    if (days < 7) return `${days} дн тому`
    return d.toLocaleDateString('uk-UA')
  }

  const getViewTitle = () => {
    switch (view) {
      case 'main':
        return 'Підтримка'
      case 'faq-answer':
        return 'Відповідь'
      case 'new-ticket':
        return 'Нове звернення'
      case 'tickets':
        return 'Мої звернення'
      case 'ticket-detail':
        return currentTicket?.subject || 'Звернення'
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 right-4 md:bottom-22 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-[400px] bg-background border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'min(580px, calc(100vh - 160px))' }}
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center gap-3">
              {view !== 'main' && (
                <button onClick={handleBack} className="hover:bg-white/20 rounded-full p-1 transition">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{getViewTitle()}</h3>
                {view === 'main' && (
                  <p className="text-xs text-white/70">Як ми можемо допомогти?</p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* MAIN VIEW */}
              {view === 'main' && (
                <div className="p-4 space-y-4">
                  {/* Quick answers section */}
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Популярні питання
                    </h4>
                    <div className="space-y-2">
                      {popularQuestions.map((faq, i) => {
                        const Icon = faq.icon
                        return (
                          <button
                            key={i}
                            onClick={() => handleOpenFaq(faq)}
                            className="w-full text-left px-3 py-2.5 rounded-lg border hover:bg-muted/50 transition flex items-center gap-3 group"
                          >
                            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{faq.question}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Не знайшли відповідь? Напишіть нам!
                    </p>
                    <button
                      onClick={() => setView('new-ticket')}
                      className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Написати в підтримку
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          setView('tickets')
                          fetchTickets()
                        }}
                        className="w-full mt-2 border rounded-lg py-2.5 text-sm font-medium hover:bg-muted/50 transition flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Мої звернення
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FAQ ANSWER */}
              {view === 'faq-answer' && selectedFaq && (
                <div className="p-4 space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <selectedFaq.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-sm">{selectedFaq.question}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedFaq.answer}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Це допомогло?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          toast.success('Дякуємо за відгук!')
                          setView('main')
                        }}
                        className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2 text-sm font-medium hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20 transition"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Так
                      </button>
                      <button
                        onClick={() => {
                          setNewTicketData((prev) => ({
                            ...prev,
                            subject: selectedFaq?.question || '',
                          }))
                          setView('new-ticket')
                        }}
                        className="flex-1 flex items-center justify-center gap-2 border rounded-lg py-2 text-sm font-medium hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 transition"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Ні, потрібна допомога
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NEW TICKET FORM */}
              {view === 'new-ticket' && (
                <div className="p-4 space-y-3">
                  {!isAuthenticated && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Ваше ім&apos;я *
                        </label>
                        <input
                          type="text"
                          value={newTicketData.guestName}
                          onChange={(e) =>
                            setNewTicketData((prev) => ({ ...prev, guestName: e.target.value }))
                          }
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Ваше ім'я"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={newTicketData.guestEmail}
                          onChange={(e) =>
                            setNewTicketData((prev) => ({ ...prev, guestEmail: e.target.value }))
                          }
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="your@email.com"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Категорія
                    </label>
                    <select
                      value={newTicketData.category}
                      onChange={(e) =>
                        setNewTicketData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Тема *
                    </label>
                    <input
                      type="text"
                      value={newTicketData.subject}
                      onChange={(e) =>
                        setNewTicketData((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Коротко опишіть проблему"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Повідомлення *
                    </label>
                    <textarea
                      value={newTicketData.message}
                      onChange={(e) =>
                        setNewTicketData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      rows={4}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Детально опишіть вашу проблему або запитання..."
                    />
                  </div>
                  <button
                    onClick={handleCreateTicket}
                    disabled={isLoading}
                    className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Відправити
                  </button>
                </div>
              )}

              {/* TICKETS LIST */}
              {view === 'tickets' && (
                <div className="p-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        У вас поки немає звернень
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tickets.map((ticket) => (
                        <button
                          key={ticket._id}
                          onClick={() => handleOpenTicket(ticket)}
                          className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-sm font-medium truncate flex-1">
                              {!ticket.isReadByUser && (
                                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0" />
                              )}
                              {ticket.subject}
                            </span>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(ticket.lastMessageAt || ticket.createdAt)}
                            {' · '}
                            {ticket.messages?.length || 0} повідомл.
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TICKET DETAIL (CHAT) */}
              {view === 'ticket-detail' && currentTicket && (
                <div className="flex flex-col" style={{ height: 'calc(min(580px, calc(100vh - 160px)) - 52px)' }}>
                  {/* Status bar */}
                  <div className="px-4 py-2 border-b flex items-center justify-between bg-muted/30">
                    {getStatusBadge(currentTicket.status)}
                    <span className="text-xs text-muted-foreground">
                      {categoryOptions.find((c) => c.value === currentTicket.category)?.label || currentTicket.category}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentTicket.messages?.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'system' ? (
                          <div className="text-center w-full">
                            <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                              {msg.text}
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                              msg.sender === 'user'
                                ? 'bg-primary text-white rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            }`}
                          >
                            {msg.sender === 'admin' && (
                              <div className="flex items-center gap-1 mb-1">
                                <User className="h-3 w-3" />
                                <span className="text-xs font-medium">
                                  {msg.senderName || 'Підтримка'}
                                </span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                msg.sender === 'user' ? 'text-white/60' : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleString('uk-UA', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  {currentTicket.status !== 'closed' && (
                    <div className="border-t p-3">
                      <div className="flex gap-2 items-end">
                        <textarea
                          ref={inputRef}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          rows={1}
                          className="flex-1 border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none max-h-24"
                          placeholder="Напишіть повідомлення..."
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={isLoading || !messageText.trim()}
                          className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {currentTicket.status === 'closed' && (
                    <div className="border-t p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        Це звернення закрито. Створіть нове, якщо маєте запитання.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
