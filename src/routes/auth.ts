import { Router } from 'express';
import { body } from 'express-validator';
import * as auth from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';
import { UserRole } from '../types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Авторизация и управление пользователями
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Войти в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@brio-cafe.ru
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные учётные данные
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен'),
  ],
  validateRequest,
  auth.login
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Обновить access token
 *     tags: [Auth]
 */
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token обязателен')],
  validateRequest,
  auth.refreshToken
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, auth.getMe);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Изменить пароль
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
    body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль минимум 6 символов'),
  ],
  validateRequest,
  auth.changePassword
);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Список пользователей (только admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', authenticate, authorize(UserRole.ADMIN), auth.listUsers);

/**
 * @swagger
 * /auth/users:
 *   post:
 *     summary: Создать пользователя (только admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/users',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
    body('name').notEmpty().withMessage('Имя обязательно'),
  ],
  validateRequest,
  auth.createUser
);

export default router;
