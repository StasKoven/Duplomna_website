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
import s from './ChatWidget.module.css'

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
  const prevIsAuthenticated = useRef(isAuthenticated)

  // Скидання стану чату при виході
  useEffect(() => {
    if (prevIsAuthenticated.current && !isAuthenticated) {
      setView('main')
      setTickets([])
      setCurrentTicket(null)
      setMessageText('')
      setUnreadCount(0)
      setNewTicketData({ subject: '', message: '', category: 'other', guestName: '', guestEmail: '' })
      setSelectedFaq(null)
      setIsOpen(false)
    }
    prevIsAuthenticated.current = isAuthenticated
  }, [isAuthenticated])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Завантаження тікетів
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

  // Прокрутка донизу при зміні повідомлень
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

  // Статус-бейдж тікета
  const getStatusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      open: { cls: s.statusOpen, label: 'Відкритий' },
      'in-progress': { cls: s.statusInProgress, label: 'В обробці' },
      resolved: { cls: s.statusResolved, label: 'Вирішено' },
      closed: { cls: s.statusClosed, label: 'Закритий' },
    }
    const badge = map[status] || map.open
    return (
      <span className={`${s.statusBadge} ${badge.cls}`}>
        {badge.label}
      </span>
    )
  }

  // Форматування часу
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

  // Заголовок поточного виду
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
      {/* Плаваюча кнопка */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={s.floatingBtn}
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
              <X className={s.iconMd} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className={s.iconMd} />
            </motion.div>
          )}
        </AnimatePresence>
        {unreadCount > 0 && !isOpen && (
          <span className={s.unreadBadge}>
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Панель чату */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={s.chatPanel}
            style={{ maxHeight: 'min(580px, calc(100vh - 160px))' }}
          >
            {/* Заголовок */}
            <div className={s.header}>
              {view !== 'main' && (
                <button onClick={handleBack} className={s.headerBtn}>
                  <ChevronLeft className={s.iconSm} />
                </button>
              )}
              <div className={s.headerTitleWrap}>
                <h3 className={s.headerTitle}>{getViewTitle()}</h3>
                {view === 'main' && (
                  <p className={s.headerSubtitle}>Як ми можемо допомогти?</p>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={s.headerBtn}
              >
                <X className={s.iconSm} />
              </button>
            </div>

            {/* Контент */}
            <div className={s.content}>
              {/* ГОЛОВНЕ МЕНЮ */}
              {view === 'main' && (
                <div className={s.mainView}>
                  {/* Популярні питання */}
                  <div>
                    <h4 className={s.sectionTitle}>
                      <HelpCircle className={s.iconSm} />
                      Популярні питання
                    </h4>
                    <div className={s.faqList}>
                      {popularQuestions.map((faq, i) => {
                        const Icon = faq.icon
                        return (
                          <button
                            key={i}
                            onClick={() => handleOpenFaq(faq)}
                            className={`group ${s.faqBtn}`}
                          >
                            <div className={s.faqIconWrap}>
                              <Icon className={s.faqIcon} />
                            </div>
                            <span className={s.faqText}>{faq.question}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Роздільник */}
                  <div className={s.divider}>
                    <p className={s.dividerText}>
                      Не знайшли відповідь? Напишіть нам!
                    </p>
                    <button
                      onClick={() => setView('new-ticket')}
                      className={s.primaryBtn}
                    >
                      <Send className={s.iconSm} />
                      Написати в підтримку
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          setView('tickets')
                          fetchTickets()
                        }}
                        className={s.secondaryBtn}
                      >
                        <MessageCircle className={s.iconSm} />
                        Мої звернення
                        {unreadCount > 0 && (
                          <span className={s.unreadBadgeSm}>
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FAQ ВІДПОВІДЬ */}
              {view === 'faq-answer' && selectedFaq && (
                <div className={s.faqAnswerView}>
                  <div className={s.faqCard}>
                    <div className={s.faqCardHeader}>
                      <selectedFaq.icon className={s.faqCardIcon} />
                      <h4 className={s.faqCardTitle}>{selectedFaq.question}</h4>
                    </div>
                    <p className={s.faqCardAnswer}>
                      {selectedFaq.answer}
                    </p>
                  </div>
                  <div className={s.feedbackSection}>
                    <p className={s.feedbackText}>
                      Це допомогло?
                    </p>
                    <div className={s.feedbackBtns}>
                      <button
                        onClick={() => {
                          toast.success('Дякуємо за відгук!')
                          setView('main')
                        }}
                        className={s.yesBtn}
                      >
                        <CheckCircle2 className={s.checkIcon} />
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
                        className={s.noBtn}
                      >
                        <AlertCircle className={s.alertIcon} />
                        Ні, потрібна допомога
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ФОРМА НОВОГО ЗВЕРНЕННЯ */}
              {view === 'new-ticket' && (
                <div className={s.form}>
                  {!isAuthenticated && (
                    <>
                      <div>
                        <label className={s.label}>
                          Ваше ім&apos;я *
                        </label>
                        <input
                          type="text"
                          value={newTicketData.guestName}
                          onChange={(e) =>
                            setNewTicketData((prev) => ({ ...prev, guestName: e.target.value }))
                          }
                          className={s.input}
                          placeholder="Ваше ім'я"
                        />
                      </div>
                      <div>
                        <label className={s.label}>
                          Email *
                        </label>
                        <input
                          type="email"
                          value={newTicketData.guestEmail}
                          onChange={(e) =>
                            setNewTicketData((prev) => ({ ...prev, guestEmail: e.target.value }))
                          }
                          className={s.input}
                          placeholder="your@email.com"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className={s.label}>
                      Категорія
                    </label>
                    <select
                      value={newTicketData.category}
                      onChange={(e) =>
                        setNewTicketData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className={s.input}
                    >
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={s.label}>
                      Тема *
                    </label>
                    <input
                      type="text"
                      value={newTicketData.subject}
                      onChange={(e) =>
                        setNewTicketData((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      className={s.input}
                      placeholder="Коротко опишіть проблему"
                    />
                  </div>
                  <div>
                    <label className={s.label}>
                      Повідомлення *
                    </label>
                    <textarea
                      value={newTicketData.message}
                      onChange={(e) =>
                        setNewTicketData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      rows={4}
                      className={s.textareaField}
                      placeholder="Детально опишіть вашу проблему або запитання..."
                    />
                  </div>
                  <button
                    onClick={handleCreateTicket}
                    disabled={isLoading}
                    className={s.submitBtn}
                  >
                    {isLoading ? (
                      <Loader2 className={s.spinIcon} />
                    ) : (
                      <Send className={s.iconSm} />
                    )}
                    Відправити
                  </button>
                </div>
              )}

              {/* СПИСОК ТІКЕТІВ */}
              {view === 'tickets' && (
                <div className={s.ticketsView}>
                  {tickets.length === 0 ? (
                    <div className={s.emptyState}>
                      <MessageCircle className={s.emptyIcon} />
                      <p className={s.emptyText}>
                        У вас поки немає звернень
                      </p>
                    </div>
                  ) : (
                    <div className={s.ticketsList}>
                      {tickets.map((ticket) => (
                        <button
                          key={ticket._id}
                          onClick={() => handleOpenTicket(ticket)}
                          className={s.ticketItem}
                        >
                          <div className={s.ticketHeader}>
                            <span className={s.ticketTitle}>
                              {!ticket.isReadByUser && (
                                <span className={s.unreadDot} />
                              )}
                              {ticket.subject}
                            </span>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className={s.ticketMeta}>
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

              {/* ДЕТАЛІ ТІКЕТА (ЧАТ) */}
              {view === 'ticket-detail' && currentTicket && (
                <div className={s.ticketDetail} style={{ height: 'calc(min(580px, calc(100vh - 160px)) - 52px)' }}>
                  {/* Статус */}
                  <div className={s.statusBar}>
                    {getStatusBadge(currentTicket.status)}
                    <span className={s.categoryLabel}>
                      {categoryOptions.find((c) => c.value === currentTicket.category)?.label || currentTicket.category}
                    </span>
                  </div>

                  {/* Повідомлення */}
                  <div className={s.messages}>
                    {currentTicket.messages?.map((msg) => (
                      <div
                        key={msg._id}
                        className={`${s.messageRow} ${msg.sender === 'user' ? s.messageRowUser : s.messageRowOther}`}
                      >
                        {msg.sender === 'system' ? (
                          <div className={s.systemMsg}>
                            <span className={s.systemMsgText}>
                              {msg.text}
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`${s.messageBubble} ${
                              msg.sender === 'user'
                                ? s.messageBubbleUser
                                : s.messageBubbleAdmin
                            }`}
                          >
                            {msg.sender === 'admin' && (
                              <div className={s.adminHeader}>
                                <User className={s.adminIcon} />
                                <span className={s.adminName}>
                                  {msg.senderName || 'Підтримка'}
                                </span>
                              </div>
                            )}
                            <p className={s.msgText}>{msg.text}</p>
                            <p
                              className={`${s.msgTime} ${
                                msg.sender === 'user' ? s.msgTimeUser : s.msgTimeOther
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

                  {/* Поле вводу */}
                  {currentTicket.status !== 'closed' && (
                    <div className={s.inputArea}>
                      <div className={s.inputRow}>
                        <textarea
                          ref={inputRef}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          rows={1}
                          className={s.chatInput}
                          placeholder="Напишіть повідомлення..."
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={isLoading || !messageText.trim()}
                          className={s.sendBtn}
                        >
                          {isLoading ? (
                            <Loader2 className={s.spinIcon} />
                          ) : (
                            <Send className={s.iconSm} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {currentTicket.status === 'closed' && (
                    <div className={s.closedArea}>
                      <p className={s.closedText}>
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
