# Electronics Store Backend API

Професійний backend для інтернет-магазину електронних засобів з використанням Node.js, Express, MongoDB та JWT автентифікації.

## 🚀 Основні можливості

- ✅ **Автентифікація та авторизація** з JWT (Access & Refresh tokens)
- ✅ **Перевірка ролей** (User / Admin)
- ✅ **Захист API** з rate limiting, helmet, CORS
- ✅ **Валідація даних** з express-validator
- ✅ **CRUD операції** для товарів, категорій, замовлень
- ✅ **Фільтрація, пошук, сортування** товарів
- ✅ **Система відгуків** з рейтингом
- ✅ **Управління кошиком** та списком бажань
- ✅ **Обробка замовлень** з різними статусами
- ✅ **Адмін панель** для управління товарами, користувачами, замовленнями

## 📋 Вимоги

- Node.js 16+ 
- MongoDB 5+
- npm або yarn

## 🔧 Встановлення

1. **Клонуйте репозиторій та перейдіть в папку backend**

```bash
cd backend
```

2. **Встановіть залежності**

```bash
npm install
```

3. **Налаштуйте змінні середовища**

Створіть файл `.env` на основі `.env.example`:

```bash
cp .env.example .env
```

Відредагуйте `.env` файл:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/electronics-store

# JWT Secrets (використовуйте сильні випадкові рядки)
JWT_ACCESS_SECRET=your_very_strong_secret_min_32_characters
JWT_REFRESH_SECRET=your_very_strong_refresh_secret_min_32_characters
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Admin Credentials
ADMIN_EMAIL=admin@electronics.com
ADMIN_PASSWORD=Admin123!@#
```

4. **Заповніть базу даних тестовими даними**

```bash
npm run seed
```

5. **Запустіть сервер**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Сервер буде доступний за адресою: `http://localhost:5000`

## 📚 API Endpoints

### Автентифікація (`/api/auth`)

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| POST | `/register` | Реєстрація користувача | Public |
| POST | `/login` | Вхід в систему | Public |
| POST | `/refresh` | Оновлення токена | Public |
| POST | `/logout` | Вихід з системи | Private |
| GET | `/profile` | Отримати профіль | Private |
| PUT | `/profile` | Оновити профіль | Private |
| PUT | `/password` | Змінити пароль | Private |

### Товари (`/api/products`)

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| GET | `/` | Список товарів (з фільтрами) | Public |
| GET | `/featured` | Рекомендовані товари | Public |
| GET | `/:id` | Деталі товару | Public |
| GET | `/:id/related` | Схожі товари | Public |
| POST | `/` | Створити товар | Admin |
| PUT | `/:id` | Оновити товар | Admin |
| DELETE | `/:id` | Видалити товар | Admin |
| GET | `/stats` | Статистика товарів | Admin |

**Параметри фільтрації:**
- `page` - номер сторінки
- `limit` - кількість елементів
- `sort` - сортування (-createdAt, price, -price, etc.)
- `category` - ID категорії
- `minPrice` / `maxPrice` - діапазон цін
- `brand` - бренд
- `search` - текстовий пошук
- `inStock` - тільки в наявності
- `featured` - тільки рекомендовані
- `onSale` - тільки зі знижкою

### Категорії (`/api/categories`)

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| GET | `/` | Список категорій | Public |
| GET | `/:id` | Деталі категорії | Public |
| POST | `/` | Створити категорію | Admin |
| PUT | `/:id` | Оновити категорію | Admin |
| DELETE | `/:id` | Видалити категорію | Admin |

### Замовлення (`/api/orders`)

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| POST | `/` | Створити замовлення | Private |
| GET | `/my-orders` | Мої замовлення | Private |
| GET | `/all` | Всі замовлення | Admin |
| GET | `/:id` | Деталі замовлення | Private |
| PUT | `/:id/status` | Оновити статус | Admin |
| GET | `/stats` | Статистика замовлень | Admin |

### Користувачі (`/api/users`)

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| GET | `/` | Список користувачів | Admin |
| GET | `/:id` | Деталі користувача | Admin |
| PUT | `/:id` | Оновити користувача | Admin |
| DELETE | `/:id` | Видалити користувача | Admin |
| POST | `/wishlist` | Додати в список бажань | Private |
| DELETE | `/wishlist/:productId` | Видалити з списку бажань | Private |
| PUT | `/cart` | Оновити кошик | Private |

### Відгуки (`/api/reviews`)

| Метод | Endpoint | Опис | Доступ |
|-------|----------|------|--------|
| POST | `/` | Створити відгук | Private |
| GET | `/product/:productId` | Відгуки товару | Public |
| PUT | `/:id/helpful` | Позначити корисним | Private |
| DELETE | `/:id` | Видалити відгук | Private/Admin |

## 🔐 Безпека

- **JWT токени** (Access + Refresh)
- **bcrypt** хешування паролів (12 rounds)
- **Helmet** для HTTP headers захисту
- **Rate limiting** - обмеження запитів
- **CORS** налаштування
- **Mongo Sanitize** - захист від NoSQL ін'єкцій
- **Express Validator** - валідація вхідних даних
- **Перевірка ролей** для адмін endpoints

## 📊 Структура проєкту

```
backend/
├── controllers/        # Контролери (бізнес-логіка)
├── models/            # Mongoose моделі
├── routes/            # Express маршрути
├── middleware/        # Middleware (auth, validation, errors)
├── scripts/           # Утилітарні скрипти (seed)
├── .env.example       # Приклад змінних середовища
├── server.js          # Точка входу
└── package.json
```

## 🧪 Тестування API

Використовуйте Postman або Thunder Client для тестування.

**Приклад запиту для входу:**

```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@electronics.com",
  "password": "Admin123!@#"
}
```

**Відповідь:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@electronics.com",
    "role": "admin"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

Для захищених endpoints використовуйте Bearer token:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 👨‍💼 Адміністратор за замовчуванням

Email: `admin@electronics.com`  
Пароль: `Admin123!@#`

## 📝 Ліцензія

MIT
