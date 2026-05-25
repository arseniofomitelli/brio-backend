import { Router } from 'express';
import { body, param } from 'express-validator';
import * as gallery from '../controllers/galleryController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';
import { uploadGalleryPhoto } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Gallery
 *   description: Фотогалерея кафе
 */

/**
 * @swagger
 * /gallery:
 *   get:
 *     summary: Получить все фото галереи
 *     tags: [Gallery]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Список фотографий
 */
router.get('/', gallery.getGallery);

router.get('/:id', [param('id').isInt()], validateRequest, gallery.getGalleryItemById);

/**
 * @swagger
 * /gallery:
 *   post:
 *     summary: Загрузить фото в галерею (admin)
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               titleRu:
 *                 type: string
 *               titleIt:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 */
router.post('/', authenticate, uploadGalleryPhoto, gallery.uploadGalleryImage);

router.put(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validateRequest,
  gallery.updateGalleryItem
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validateRequest,
  gallery.deleteGalleryItem
);

/**
 * @swagger
 * /gallery/reorder:
 *   put:
 *     summary: Изменить порядок фото (admin)
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/reorder',
  authenticate,
  [
    body('order').isArray({ min: 1 }).withMessage('Массив порядка обязателен'),
    body('order.*.id').isInt().withMessage('ID должен быть числом'),
    body('order.*.sortOrder').isInt({ min: 0 }).withMessage('sortOrder должен быть неотрицательным числом'),
  ],
  validateRequest,
  gallery.reorderGallery
);

export default router;
