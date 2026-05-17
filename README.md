# TechStore — Інтернет-магазин електроніки

Повностековий інтернет-магазин електроніки з сучасним UI, JWT-автентифікацією та адмін-панеллю.

## Стек технологій

**Frontend** — Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Hook Form + Zod, Axios  
**Backend** — Node.js, Express, MongoDB + Mongoose, JWT, Firebase Admin, Cloudinary  
**Deploy** — Railway

## Структура репозиторію

```
├── frontend/                   # Next.js 14 (App Router)
│   └── src/
│       ├── app/                # Маршрути сторінок
│       │   ├── (public)/       # Головна, каталог, товар, категорії
│       │   ├── admin/          # Адмін-панель (products, orders, users, categories, coupons, tickets)
│       │   ├── cart/           # Кошик
│       │   ├── checkout/       # Оформлення замовлення
│       │   ├── orders/         # Замовлення та повернення
│       │   ├── wishlist/       # Список бажань
│       │   ├── compare/        # Порівняння товарів
│       │   ├── profile/        # Профіль користувача
│       │   └── (info)/         # about, faq, contact, delivery, warranty
│       ├── components/         # React-компоненти
│       │   ├── layout/         # Header, Footer, BottomNav, NotificationBell
│       │   ├── home/           # HeroSection, Categories, FeaturedProducts, PromoSection
│       │   ├── products/       # ProductCard, ProductFilters, ReviewSection, Rating
│       │   ├── checkout/       # CouponInput
│       │   ├── chat/           # ChatWidget
│       │   └── providers/      # ThemeProvider
│       ├── store/              # Zustand: authStore, cartStore
│       ├── lib/                # api.ts (Axios), utils.ts
│       └── types/              # TypeScript-типи
│
└── backend/                    # Express REST API
    ├── controllers/            # Бізнес-логіка
    ├── models/                 # Mongoose-схеми
    ├── routes/                 # Express-маршрути
    ├── middleware/             # auth, validation, error handling
    ├── config/                 # Firebase, DB підключення
    ├── api/                    # Зовнішні API (Нова Пошта тощо)
    └── scripts/                # seed та інші утиліти
```

## Швидкий старт

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # заповніть змінні (MongoDB, JWT, Firebase тощо)
npm run seed           # заповнити БД тестовими даними
npm run dev            # → http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # вкажіть NEXT_PUBLIC_API_URL та Firebase-ключі
npm run dev            # → http://localhost:3000
```

### Вимоги

- Node.js 18+
- MongoDB 5+ (локально або MongoDB Atlas)

## Змінні середовища

### Backend (`.env`)

| Змінна | Приклад | Опис |
|--------|---------|------|
| `MONGODB_URI` | `mongodb://localhost:27017/electronics-store` | Рядок підключення MongoDB |
| `JWT_ACCESS_SECRET` | *(32+ символи)* | Секрет для access-токена |
| `JWT_REFRESH_SECRET` | *(32+ символи)* | Секрет для refresh-токена |
| `FIREBASE_PROJECT_ID` | `your-project-id` | Firebase Admin |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud` | Cloudinary для зображень |
| `ADMIN_EMAIL` | `admin@example.com` | Email першого адміна (`npm run seed`) |
| `ADMIN_PASSWORD` | `Admin123!` | Пароль першого адміна |

Повний список — у [backend/.env.example](backend/.env.example).

### Frontend (`.env`)

| Змінна | Опис |
|--------|------|
| `NEXT_PUBLIC_API_URL` | URL backend API, напр. `http://localhost:5000/api` |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client-конфіг (публічні ключі) |

Повний список — у [frontend/.env.example](frontend/.env.example).

## API

Базовий URL: `http://localhost:5000/api`

### Автентифікація `/api/auth`

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| POST | `/register` | Реєстрація | Public |
| POST | `/login` | Вхід (email + пароль) | Public |
| POST | `/google` | Вхід через Google (Firebase ID token) | Public |
| POST | `/refresh` | Оновлення access-токена | Public |
| POST | `/logout` | Вихід | Private |
| GET | `/profile` | Отримати профіль | Private |
| PUT | `/profile` | Оновити профіль | Private |
| PUT | `/password` | Змінити пароль | Private |

### Товари `/api/products`

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| GET | `/` | Список з фільтрами | Public |
| GET | `/featured` | Рекомендовані | Public |
| GET | `/:id` | Деталі товару | Public |
| GET | `/:id/related` | Схожі товари | Public |
| POST | `/` | Створити | Admin |
| PUT | `/:id` | Оновити | Admin |
| DELETE | `/:id` | Видалити | Admin |

**Параметри фільтрації:** `page`, `limit`, `sort`, `category`, `minPrice`, `maxPrice`, `brand`, `search`, `inStock`, `featured`, `onSale`

### Категорії `/api/categories`

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| GET | `/` | Список | Public |
| GET | `/:id` | Деталі | Public |
| POST | `/` | Створити | Admin |
| PUT | `/:id` | Оновити | Admin |
| DELETE | `/:id` | Видалити | Admin |

### Замовлення `/api/orders`

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| POST | `/` | Створити замовлення | Private |
| GET | `/my-orders` | Мої замовлення | Private |
| GET | `/:id` | Деталі замовлення | Private |
| GET | `/all` | Всі замовлення | Admin |
| PUT | `/:id/status` | Оновити статус | Admin |

### Користувачі `/api/users`

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| GET | `/` | Список | Admin |
| GET | `/:id` | Деталі | Admin |
| PUT | `/:id` | Оновити | Admin |
| DELETE | `/:id` | Видалити | Admin |
| POST | `/wishlist` | Додати до бажань | Private |
| DELETE | `/wishlist/:productId` | Видалити з бажань | Private |
| PUT | `/cart` | Оновити кошик | Private |

### Відгуки `/api/reviews`

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| POST | `/` | Залишити відгук | Private |
| GET | `/product/:productId` | Відгуки товару | Public |
| PUT | `/:id/helpful` | Позначити корисним | Private |
| DELETE | `/:id` | Видалити | Private/Admin |

Захищені endpoints використовують Bearer-токен: `Authorization: Bearer <access_token>`

## Основні можливості

### Покупець
- Каталог з фільтрацією за категорією, брендом, ціною, рейтингом і текстовим пошуком
- Порівняння товарів
- Кошик та список бажань (зберігаються між сесіями)
- Оформлення замовлення з купоном на знижку
- Трекінг статусу замовлення та заявка на повернення
- Відгуки з рейтингом
- Онлайн-чат підтримки
- Сповіщення (NotificationBell)

### Автентифікація
- Email/пароль або Google OAuth (Firebase)
- JWT: access-токен (15 хв) + refresh-токен (7 днів)
- Автоматичне оновлення токенів через Axios interceptors

### Адмін-панель (`/admin`)
- Dashboard зі статистикою продажів
- CRUD товарів із завантаженням зображень (Cloudinary)
- CRUD категорій
- Управління замовленнями та їх статусами
- Управління користувачами
- Купони на знижку
- Тікети підтримки

### Безпека
- Helmet (HTTP-заголовки)
- CORS з whitelist
- Rate limiting
- Mongo sanitize (захист від NoSQL-ін'єкцій)
- express-validator на всіх вхідних даних
- bcrypt (12 rounds) для паролів

## Скрипти

### Frontend

```bash
npm run dev        # dev-сервер → http://localhost:3000
npm run build      # production-білд
npm run start      # запуск production
npm run lint       # ESLint
```

### Backend

```bash
npm run dev        # nodemon dev-сервер → http://localhost:5000
npm start          # production
npm run seed       # заповнити БД тестовими даними
```

## Deploy

Проєкт налаштований для деплою на [Railway](https://railway.app) — конфігурація у `railway.json`.  
Frontend та Backend деплояться як окремі сервіси з відповідними змінними середовища.

## Ліцензія

MIT
