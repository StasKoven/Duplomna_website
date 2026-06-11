'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, ChevronDown, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import s from './Footer.module.css'

// Згортана секція для мобільних пристроїв
function FooterSection({ 
  title, 
  children,
  defaultOpen = false 
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={s.sectionWrapper}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={s.sectionButton}
      >
        <h3 className={s.sectionTitle}>{title}</h3>
        <ChevronDown 
          className={cn(
            s.chevron,
            isOpen && s.chevronOpen
          )} 
        />
      </button>
      <div className={cn(
        s.sectionContent,
        isOpen ? s.sectionContentOpen : s.sectionContentClosed
      )}>
        {children}
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`container-custom ${s.container}`}>
        <div className={s.gridLayout}>
          {/* ==================== */}
          {/* Інформація про магазин */}
          {/* Завжди видима на мобільних */}
          {/* Містить опис та соціальні мережі */}
          {/* ==================== */}
          <div className={s.aboutSection}>
            <h3 className={s.aboutTitle}>Tech<span className={s.aboutTitleAccent}>Store</span></h3>
            <p className={s.aboutDescription}>
              Інтернет-магазин електроніки з 2020 року. Працюємо напряму з офіційними дистрибуторами.
            </p>
            <div className={s.socialLinks}>
              <a href="#" className={s.socialLinkFirst} aria-label="Facebook">
                <Facebook className={s.socialIcon} />
              </a>
              <a href="#" className={s.socialLink} aria-label="Instagram">
                <Instagram className={s.socialIcon} />
              </a>
              <a href="#" className={s.socialLink} aria-label="YouTube">
                <Youtube className={s.socialIcon} />
              </a>
              <a href="#" className={s.socialLink} aria-label="Telegram">
                <Send className={s.socialIcon} />
              </a>
            </div>
          </div>

          {/* ==================== */}
          {/* Швидкі посилання для покупців */}
          {/* Згортається на мобільних пристроях */}
          {/* ==================== */}
          <FooterSection title="Покупцям">
            <ul className={s.linksList}>
              <li>
                <Link href="/about" className={s.footerLink}>
                  Про нас
                </Link>
              </li>
              <li>
                <Link href="/delivery" className={s.footerLink}>
                  Доставка та оплата
                </Link>
              </li>
              <li>
                <Link href="/warranty" className={s.footerLink}>
                  Гарантія та повернення
                </Link>
              </li>
              <li>
                <Link href="/faq" className={s.footerLink}>
                  Питання та відповіді
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* ==================== */}
          {/* Посилання на категорії товарів */}
          {/* Згортається на мобільних пристроях */}
          {/* ==================== */}
          <FooterSection title="Категорії">
            <ul className={s.linksList}>
              <li>
                <Link href="/products?category=smartphones" className={s.footerLink}>
                  Смартфони
                </Link>
              </li>
              <li>
                <Link href="/products?category=laptops" className={s.footerLink}>
                  Ноутбуки
                </Link>
              </li>
              <li>
                <Link href="/products?category=tablets" className={s.footerLink}>
                  Планшети
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className={s.footerLink}>
                  Аксесуари
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* ==================== */}
          {/* Контактна інформація магазину */}
          {/* Адреса, телефон, email */}
          {/* Відкрита за замовчуванням на мобільних */}
          {/* ==================== */}
          <FooterSection title="Контакти" defaultOpen>
            <ul className={s.contactList}>
              <li className={s.contactItemAddress}>
                <MapPin className={s.addressIcon} />
                <span className={s.addressText}>м. Київ, вул. Хрещатик, 1</span>
              </li>
              <li>
                <a href="tel:+380441234567" className={s.contactLink}>
                  <Phone className={s.contactIcon} />
                  <span>+38 (044) 123-45-67</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@techstore.ua" className={s.contactLink}>
                  <Mail className={s.contactIcon} />
                  <span>info@techstore.ua</span>
                </a>
              </li>
            </ul>
          </FooterSection>
        </div>

        {/* Нижня панель з копірайтом */}
        <div className={s.bottomBar}>
          {/* suppressHydrationWarning: with cached SSR the rendered year can lag
              the client's year around New Year — tolerate the diff instead of
              triggering a hydration mismatch. */}
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} TechStore. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  )
}
