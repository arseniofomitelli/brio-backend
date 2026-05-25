import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as menu from '../controllers/menuController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';
import { uploadMenuPhoto } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Управление меню кафе
 */

// ─── Categories ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /menu/categories:
 *   get:
 *     summary: Получить все категории меню
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema: { type: boolean }
 *         description: Включить неактивные категории (только для авторизованных)
 *     responses:
 *       200:
 *         description: Список категорий
 */
router.get('/categories', menu.getCategories);
router.get('/categories/:slug/by-slug', menu.getCategoryBySlug);

/**
 * @swagger
 * /menu/categories/{id}:
 *   get:
 *     summary: Получить категорию по ID
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/categories/:id', [param('id').isInt()], validateRequest, menu.getCategoryById);

/**
 * @swagger
 * /menu/categories:
 *   post:
 *     summary: Создать категорию (admin)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nameRu, nameIt, slug]
 *             properties:
 *               nameRu: { type: string, example: "Закуски" }
 *               nameIt: { type: string, example: "Antipasti" }
 *               slug: { type: string, example: "antipasti" }
 *               description: { type: string }
 *               sortOrder: { type: integer }
 */
router.post(
  '/categories',
  authenticate,
  [
    body('nameRu').notEmpty().withMessage('Название (рус) обязательно'),
    body('nameIt').notEmpty().withMessage('Название (ит) обязательно'),
    body('slug')
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug: только строчные латинские буквы, цифры и дефис'),
  ],
  validateRequest,
  menu.createCategory
);

router.put(
  '/categories/:id',
  authenticate,
  [param('id').isInt()],
  validateRequest,
  menu.updateCategory
);

router.delete(
  '/categories/:id',
  authenticate,
  [param('id').isInt()],
  validateRequest,
  menu.deleteCategory
);

router.post(
  '/categories/:id/image',
  authenticate,
  uploadMenuPhoto,
  menu.uploadCategoryImage
);

// ─── Menu Items ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /menu/items:
 *   get:
 *     summary: Получить блюда меню
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer }
 *       - in: query
 *         name: isAvailable
 *         schema: { type: boolean }
 *       - in: query
 *         name: isSpecial
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: "Тег: vegetarian, vegan, spicy, gluten-free"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 */
router.get(
  '/items',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  menu.getMenuItems
);

router.get('/items/specials', menu.getSpecials);

router.get(
  '/items/:id',
  [param('id').isInt()],
  validateRequest,
  menu.getMenuItemById
);

/**
 * @swagger
 * /menu/items:
 *   post:
 *     summary: Добавить блюдо (admin)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, nameRu, nameIt, price]
 *             properties:
 *               categoryId: { type: integer }
 *               nameRu: { type: string, example: "Карпаччо из говядины" }
 *               nameIt: { type: string, example: "Carpaccio di manzo" }
 *               descriptionRu: { type: string }
 *               descriptionIt: { type: string }
 *               price: { type: number, example: 850 }
 *               weight: { type: integer, example: 150 }
 *               calories: { type: integer }
 *               allergens: { type: array, items: { type: string } }
 *               tags: { type: array, items: { type: string } }
 *               isAvailable: { type: boolean, default: true }
 *               isSpecial: { type: boolean, default: false }
 */
router.post(
  '/items',
  authenticate,
  [
    body('categoryId').isInt().withMessage('ID категории обязателен'),
    body('nameRu').notEmpty().withMessage('Название (рус) обязательно'),
    body('nameIt').notEmpty().withMessage('Название (ит) обязательно'),
    body('price').isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
  ],
  validateRequest,
  menu.createMenuItem
);

router.put(
  '/items/:id',
  authenticate,
  [
    param('id').isInt(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  menu.updateMenuItem
);

router.delete(
  '/items/:id',
  authenticate,
  [param('id').isInt()],
  validateRequest,
  menu.deleteMenuItem
);

/**
 * @swagger
 * /menu/items/{id}/photo:
 *   post:
 *     summary: Загрузить фото блюда (admin)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 */
router.post(
  '/items/:id/photo',
  authenticate,
  uploadMenuPhoto,
  menu.uploadMenuItemPhoto
);

export default router;
