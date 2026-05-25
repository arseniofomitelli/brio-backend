# ☕ Brio Cafe — Backend API

REST API для итальянского кафе **Brio** на Node.js + Express + TypeScript + PostgreSQL.

## Стек технологий

| Слой | Технология |
|------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | Sequelize 6 |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| Uploads | Multer + Sharp (авто-оптимизация WebP) |
| Docs | Swagger / OpenAPI 3.0 |
| Tests | Jest + Supertest |
| Container | Docker + Docker Compose |

## Модули API

| Модуль | Эндпоинты | Описание |
|--------|-----------|----------|
| `Auth` | `/api/v1/auth/*` | Вход, refresh-токены, управление пользователями |
| `Menu` | `/api/v1/menu/*` | Категории и блюда (RU+IT), загрузка фото |
| `Gallery` | `/api/v1/gallery/*` | Галерея с авто-оптимизацией изображений |
| `Contacts` | `/api/v1/contacts` | Контакты, соцсети, расписание работы |

## Быстрый старт

### 1. Клонировать и установить зависимости

```bash
npm install
```

### 2. Настроить окружение

```bash
cp .env.example .env
# Отредактируйте .env под свою БД
```

### 3. Запустить PostgreSQL

```bash
docker-compose up postgres -d
```

### 4. Запустить сервер в режиме разработки

```bash
npm run dev
```

### 5. Заполнить базу тестовыми данными

```bash
npx ts-node seeds/demo-data.ts
```

После этого будет создан администратор:
- **Email:** `admin@brio-cafe.ru`
- **Пароль:** `admin123`

## Docker (production)

```bash
docker-compose up -d
```

## Документация API

После запуска откройте: **http://localhost:3000/docs**

## Основные эндпоинты

### Публичные (без авторизации)
```
GET  /health                         — проверка состояния
GET  /api/v1/menu/categories          — все категории меню
GET  /api/v1/menu/categories/:slug/by-slug — категория по slug
GET  /api/v1/menu/items               — блюда (фильтры: categoryId, tag, search)
GET  /api/v1/menu/items/specials      — специальные предложения
GET  /api/v1/menu/items/:id           — блюдо по ID
GET  /api/v1/gallery                  — галерея
GET  /api/v1/contacts                 — контакты и расписание
```

### Административные (Bearer JWT)
```
POST   /api/v1/auth/login             — войти
POST   /api/v1/auth/refresh           — обновить токен
GET    /api/v1/auth/me                — текущий пользователь

POST   /api/v1/menu/categories        — создать категорию
PUT    /api/v1/menu/categories/:id    — обновить категорию
DELETE /api/v1/menu/categories/:id    — удалить категорию
POST   /api/v1/menu/categories/:id/image — загрузить фото категории

POST   /api/v1/menu/items             — добавить блюдо
PUT    /api/v1/menu/items/:id         — обновить блюдо
DELETE /api/v1/menu/items/:id         — удалить блюдо
POST   /api/v1/menu/items/:id/photo   — загрузить фото блюда

POST   /api/v1/gallery                — добавить фото в галерею
PUT    /api/v1/gallery/:id            — обновить запись
DELETE /api/v1/gallery/:id            — удалить фото
PUT    /api/v1/gallery/reorder        — изменить порядок

PUT    /api/v1/contacts               — обновить контакты
```

## Структура проекта

```
src/
├── app.ts                # Точка входа
├── config/
│   ├── config.ts         # Конфигурация из .env
│   ├── database.ts       # Подключение к PostgreSQL
│   └── swagger.ts        # OpenAPI конфиг
├── models/
│   ├── User.ts           # Пользователи (JWT auth)
│   ├── Category.ts       # Категории меню
│   ├── MenuItem.ts       # Блюда меню
│   ├── Gallery.ts        # Фотогалерея
│   ├── Contact.ts        # Контакты и расписание
│   └── index.ts          # Ассоциации моделей
├── controllers/          # Бизнес-логика
├── routes/               # Express-маршруты + Swagger-комментарии
├── middleware/
│   ├── auth.ts           # JWT authenticate / authorize
│   ├── upload.ts         # Multer (меню / галерея)
│   └── errorHandler.ts   # Глобальный обработчик ошибок
└── utils/
    └── logger.ts         # Winston-логгер
```

## Тесты

```bash
npm test              # Все тесты
npm run test:coverage # С покрытием
```

## Переменные окружения

| Переменная | По умолчанию | Описание |
|-----------|-------------|---------|
| `PORT` | `3000` | Порт сервера |
| `DB_*` | — | Параметры PostgreSQL |
| `JWT_SECRET` | — | Секрет access-токена (мин. 32 символа) |
| `JWT_EXPIRES_IN` | `7d` | Срок действия access-токена |
| `JWT_REFRESH_SECRET` | — | Секрет refresh-токена |
| `CORS_ORIGIN` | `*` | Разрешённые origins |
| `MAX_FILE_SIZE` | `5242880` | Макс. размер файла (5 MB) |
