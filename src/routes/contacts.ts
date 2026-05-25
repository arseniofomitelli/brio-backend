import { Router } from 'express';
import { body } from 'express-validator';
import * as contacts from '../controllers/contactController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Контактная информация и расписание кафе
 */

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Получить контактную информацию
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: Контакты кафе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurantName: { type: string }
 *                     phone: { type: string }
 *                     email: { type: string }
 *                     address: { type: string }
 *                     workingHours: { type: object }
 */
router.get('/', contacts.getContacts);

/**
 * @swagger
 * /contacts:
 *   put:
 *     summary: Обновить контактную информацию (admin)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restaurantName: { type: string }
 *               taglineRu: { type: string }
 *               taglineIt: { type: string }
 *               phone: { type: string }
 *               phoneExtra: { type: string }
 *               email: { type: string, format: email }
 *               address: { type: string }
 *               addressRu: { type: string }
 *               city: { type: string }
 *               mapUrl: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               instagramUrl: { type: string }
 *               facebookUrl: { type: string }
 *               telegramUrl: { type: string }
 *               whatsappUrl: { type: string }
 *               workingHours: { type: object }
 */
router.put(
  '/',
  authenticate,
  [
    body('email').optional().isEmail().withMessage('Введите корректный email'),
    body('phone').optional().notEmpty().withMessage('Телефон не может быть пустым'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
  ],
  validateRequest,
  contacts.updateContacts
);

export default router;
