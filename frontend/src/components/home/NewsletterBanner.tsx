'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle2 } from 'lucide-react'
import s from './NewsletterBanner.module.css'

export default function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setEmail('')
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className={s.section}>
      <div className="container-custom">
        <div className={`${s.card} ${s.cardEnter}`}>
          <span className={s.glowA} aria-hidden />
          <span className={s.glowB} aria-hidden />

          <div className={s.inner}>
            <div className={s.left}>
              <div className={s.iconWrap}>
                <Mail className={s.icon} />
              </div>
              <div>
                <h2 className={s.title}>Отримуйте знижки першими</h2>
                <p className={s.description}>
                  Підпишіться на розсилку — і дізнавайтеся про акції, новинки та персональні
                  пропозиції раніше за всіх.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>
              {submitted ? (
                <div className={s.success}>
                  <CheckCircle2 className={s.successIcon} />
                  <span>Дякуємо! Перевірте пошту.</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ваш email"
                    className={s.input}
                    aria-label="Email"
                  />
                  <button type="submit" className={s.button}>
                    <span className={s.buttonText}>Підписатись</span>
                    <Send className={s.buttonIcon} />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
