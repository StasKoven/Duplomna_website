'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { toast } from 'sonner'
import s from './page.module.css'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Ваше повідомлення відправлено! Ми зв\'яжемося з вами найближчим часом.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className={`container-custom ${s.page}`}>
      <div className={s.wrapper}>
        <div className={s.header}>
          <h1 className={s.title}>Зв'яжіться з нами</h1>
          <p className={s.subtitle}>
            Маєте питання? Ми завжди раді допомогти!
          </p>
        </div>

        <div className={s.gridLayout}>
          {/* Contact Info */}
          <div>
            <h2 className={s.sectionTitle}>Контактна інформація</h2>
            
            <div className={s.contactList}>
              <div className={s.contactItem}>
                <div className={s.iconBox}>
                  <Phone className={s.icon} />
                </div>
                <div>
                  <h3 className={s.contactLabel}>Телефон</h3>
                  <p className={s.contactText}>+380 XX XXX XX XX</p>
                  <p className={s.contactSubtext}>Пн-Пт: 9:00 - 18:00</p>
                </div>
              </div>

              <div className={s.contactItem}>
                <div className={s.iconBox}>
                  <Mail className={s.icon} />
                </div>
                <div>
                  <h3 className={s.contactLabel}>Email</h3>
                  <p className={s.contactText}>support@electronics.com</p>
                  <p className={s.contactSubtext}>Відповідаємо протягом 24 годин</p>
                </div>
              </div>

              <div className={s.contactItem}>
                <div className={s.iconBox}>
                  <MapPin className={s.icon} />
                </div>
                <div>
                  <h3 className={s.contactLabel}>Адреса</h3>
                  <p className={s.contactText}>м. Київ, вул. Хрещатик, 1</p>
                  <p className={s.contactSubtext}>Офіс та шоу-рум</p>
                </div>
              </div>
            </div>

            <div className={s.hoursBox}>
              <h3 className={s.hoursTitle}>Години роботи</h3>
              <div className={s.hoursList}>
                <div className={s.hoursRow}>
                  <span className={s.hoursLabel}>Понеділок - П'ятниця:</span>
                  <span className={s.hoursValue}>9:00 - 18:00</span>
                </div>
                <div className={s.hoursRow}>
                  <span className={s.hoursLabel}>Субота:</span>
                  <span className={s.hoursValue}>10:00 - 16:00</span>
                </div>
                <div className={s.hoursRow}>
                  <span className={s.hoursLabel}>Неділя:</span>
                  <span className={s.hoursValue}>Вихідний</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className={s.sectionTitle}>Напишіть нам</h2>
            
            <form onSubmit={handleSubmit} className={s.form}>
              <div>
                <label className={s.label}>
                  Ім'я *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={s.input}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className={s.label}>
                  Тема
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={s.input}
                  placeholder="Тема повідомлення"
                />
              </div>

              <div>
                <label className={s.label}>
                  Повідомлення *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={s.textarea}
                  placeholder="Ваше повідомлення..."
                />
              </div>

              <button
                type="submit"
                className={s.submitBtn}
              >
                <Send className={s.sendIcon} />
                Відправити
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
