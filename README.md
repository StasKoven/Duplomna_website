# TechStore — Інтернет-магазин електроніки

Повностековий інтернет-магазин електроніки з сучасним UI, JWT-автентифікацією та адмін-панеллю.

## Стек технологій

**Frontend** — Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Hook Form + Zod, Axios  
**Backend** — Node.js, Express, MongoDB + Mongoose, JWT, Firebase Admin, Cloudinary  
**Deploy** — Railway

## Структура репозиторію

```
├── frontend/   # Next.js 14 (App Router)
└── backend/    # Express REST API
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

| Префікс | Опис |
|---------|------|
| `/auth` | Реєстрація, вхід, refresh, профіль |
| `/products` | CRUD товарів, пошук, фільтрація |
| `/categories` | CRUD категорій |
| `/orders` | Замовлення (user + admin) |
| `/users` | Управління користувачами (admin) |
| `/reviews` | Відгуки |

Захищені endpoints використовують Bearer-токен: `Authorization: Bearer <access_token>`

## Основні можливості

- Каталог з фільтрацією за категорією, брендом, ціною, рейтингом
- Кошик та список бажань
- Оформлення замовлень
- JWT-автентифікація (access 15 хв + refresh 7 днів) з автооновленням
- Google OAuth через Firebase
- Адмін-панель: товари, категорії, замовлення, користувачі, статистика
- Завантаження зображень через Cloudinary
- Захист: Helmet, CORS, rate limiting, mongo-sanitize

## Ліцензія

MIT
