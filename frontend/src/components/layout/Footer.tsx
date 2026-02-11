'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Collapsible section for mobile
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
    <div className="border-b border-border/50 md:border-0 py-3 md:py-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full md:cursor-default"
      >
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <ChevronDown 
          className={cn(
            "h-5 w-5 transition-transform md:hidden",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-300 md:overflow-visible",
        isOpen ? "max-h-96 mt-3 md:mt-4" : "max-h-0 md:max-h-none md:mt-4"
      )}>
        {children}
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container-custom py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-8">
          {/* ==================== */}
          {/* About Section */}
          {/* Інформація про магазин */}
          {/* Завжди видима на мобільних */}
          {/* Містить опис та соціальні мережі */}
          {/* ==================== */}
          <div className="pb-4 md:pb-0">
            <h3 className="mb-3 md:mb-4 text-base sm:text-lg font-semibold">TechStore</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ваш надійний партнер у світі електроніки. Найкращі ціни та якість гарантовані.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary p-2 -ml-2 rounded-md hover:bg-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary p-2 rounded-md hover:bg-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary p-2 rounded-md hover:bg-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* ==================== */}
          {/* Quick Links Section */}
          {/* Швидкі посилання для покупців */}
          {/* Згортається на мобільних пристроях */}
          {/* ==================== */}
          <FooterSection title="Покупцям">
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Про нас
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Доставка та оплата
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Гарантія та повернення
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Питання та відповіді
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* ==================== */}
          {/* Categories Section */}
          {/* Посилання на категорії товарів */}
          {/* Згортається на мобільних пристроях */}
          {/* ==================== */}
          <FooterSection title="Категорії">
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products?category=smartphones" className="text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Смартфони
                </Link>
              </li>
              <li>
                <Link href="/products?category=laptops" className="text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Ноутбуки
                </Link>
              </li>
              <li>
                <Link href="/products?category=tablets" className="text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Планшети
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="text-muted-foreground hover:text-primary transition-colors inline-block py-0.5">
                  Аксесуари
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* ==================== */}
          {/* Contact Section */}
          {/* Контактна інформація магазину */}
          {/* Адреса, телефон, email */}
          {/* Відкрита за замовчуванням на мобільних */}
          {/* ==================== */}
          <FooterSection title="Контакти" defaultOpen>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">м. Київ, вул. Хрещатик, 1</span>
              </li>
              <li>
                <a href="tel:+380441234567" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors py-1">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <span>+38 (044) 123-45-67</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@techstore.ua" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors py-1">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <span>info@techstore.ua</span>
                </a>
              </li>
            </ul>
          </FooterSection>
        </div>

        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TechStore. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  )
}
