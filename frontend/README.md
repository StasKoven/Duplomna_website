# TechStore Frontend

Сучасний frontend інтернет-магазину електроніки на Next.js 14+ з TypeScript, Tailwind CSS та Framer Motion.

## 🚀 Технології

- **Next.js 14+** з App Router
- **TypeScript** для типізації
- **Tailwind CSS** для стилізації
- **Framer Motion** для анімацій
- **Zustand** для state management
- **Axios** для HTTP запитів
- **React Hook Form** для форм
- **Zod** для валідації
- **Sonner** для сповіщень
- **Lucide React** для іконок

## 📋 Вимоги

- Node.js 18+
- npm або yarn
- Backend API (запущений на http://localhost:5000)

## 🔧 Встановлення

1. **Перейдіть в папку frontend**

```bash
cd frontend
```

2. **Встановіть залежності**

```bash
npm install
```

Якщо потрібен tailwindcss-animate:

```bash
npm install tailwindcss-animate
```

3. **Налаштуйте змінні середовища**

Створіть файл `.env.local`:

```bash
cp .env.local.example .env.local
```

Відредагуйте `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_NAME=TechStore
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Запустіть сервер розробки**

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) в браузері.

## 📁 Структура проєкту

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Головний layout
│   │   ├── page.tsx            # Головна сторінка
│   │   ├── products/           # Сторінки товарів
│   │   ├── cart/               # Кошик
│   │   ├── login/              # Вхід
│   │   ├── admin/              # Адмін панель
│   │   └── globals.css         # Глобальні стилі
│   ├── components/             # React компоненти
│   │   ├── layout/             # Header, Footer
│   │   ├── home/               # Компоненти головної
│   │   ├── products/           # Компоненти товарів
│   │   ├── admin/              # Компоненти адмін панелі
│   │   └── ui/                 # UI компоненти
│   ├── lib/                    # Утиліти
│   │   ├── api.ts              # Axios конфігурація
│   │   └── utils.ts            # Допоміжні функції
│   ├── store/                  # Zustand stores
│   │   ├── authStore.ts        # Автентифікація
│   │   └── cartStore.ts        # Кошик
│   └── types/                  # TypeScript типи
│       └── index.ts
├── public/                     # Статичні файли
├── next.config.js              # Next.js конфігурація
├── tailwind.config.js          # Tailwind конфігурація
└── tsconfig.json               # TypeScript конфігурація
```

## 🎨 Особливості

### Головна сторінка
- Hero секція з анімацією
- Категорії товарів
- Рекомендовані товари
- Спеціальні пропозиції

### Каталог товарів
- Фільтрація за категоріями, ціною, брендом
- Текстовий пошук
- Сортування
- Пагінація
- Responsive grid layout

### Картка товару
- Галерея зображень
- Детальна інформація
- Характеристики
- Відгуки користувачів
- Схожі товари

### Кошик
- Додавання/видалення товарів
- Зміна кількості
- Підрахунок загальної суми
- Оформлення замовлення

### Автентифікація
- Реєстрація
- Вхід
- JWT токени (access + refresh)
- Профіль користувача

### Адмін панель
- Dashboard зі статистикою
- Управління товарами (CRUD)
- Управління категоріями
- Перегляд замовлень
- Управління користувачами

### UI/UX
- Сучасний дизайн
- Dark/Light theme
- Responsive дизайн
- Анімації (Framer Motion)
- Сповіщення (Sonner)
- Skeleton loaders

## 🔐 Автентифікація

Використовується JWT з двома токенами:

- **Access Token** (15 хвилин) - для API запитів
- **Refresh Token** (7 днів) - для оновлення access token

Автоматичне оновлення токенів через Axios interceptors.

## 📱 Responsive дизайн

- Mobile-first підхід
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🚀 Запуск в production

```bash
# Build
npm run build

# Start production server
npm start
```

## 📝 Скрипти

```bash
npm run dev         # Запуск dev сервера
npm run build       # Build для production
npm run start       # Запуск production сервера
npm run lint        # ESLint перевірка
```

## 🎯 Додаткові можливості

- **SEO оптимізація** - Next.js metadata API
- **Image optimization** - Next.js Image компонент
- **Performance** - Server Components, code splitting
- **Accessibility** - ARIA атрибути, keyboard navigation
- **PWA ready** - можна додати service worker

## 📦 Додаткові бібліотеки

Для розширення функціоналу можна додати:

```bash
# Image upload
npm install react-dropzone

# Charts
npm install recharts

# Date picker
npm install react-day-picker date-fns

# Rich text editor
npm install @tiptap/react @tiptap/starter-kit

# QR codes
npm install qrcode.react
```

## 🐛 Troubleshooting

### Помилки TypeScript після встановлення

Переконайтесь що встановлені всі залежності:

```bash
npm install
```

### CORS помилки

Перевірте що backend налаштований на прийом запитів з `http://localhost:3000`.

### Помилки з зображеннями

Додайте домени в `next.config.js`:

```javascript
images: {
  domains: ['your-domain.com'],
}
```

## 📄 Ліцензія

MIT
