import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Gallery } from '../models';
import { config } from '../config/config';

export const getGallery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const where = includeInactive ? {} : { isActive: true };

    const images = await Gallery.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
};

export const getGalleryItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Gallery.findByPk(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Изображение не найдено' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const uploadGalleryImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Файл не загружен' });
      return;
    }

    const baseName = req.file.filename.replace(path.extname(req.file.filename), '');

    // Full size (max 1920px wide)
    const fullName = `${baseName}.webp`;
    await sharp(req.file.path)
      .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88 })
      .toFile(path.join(config.upload.path, 'gallery', fullName));

    // Thumbnail
    const thumbName = `thumb_${baseName}.webp`;
    await sharp(req.file.path)
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(path.join(config.upload.path, 'gallery', thumbName));

    fs.unlinkSync(req.file.path);

    const { titleRu, titleIt, sortOrder } = req.body;

    const galleryItem = await Gallery.create({
      image: `/uploads/gallery/${fullName}`,
      thumbnail: `/uploads/gallery/${thumbName}`,
      titleRu: titleRu || null,
      titleIt: titleIt || null,
      sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
    });

    res.status(201).json({ success: true, data: galleryItem, message: 'Изображение добавлено в галерею' });
  } catch (error) {
    next(error);
  }
};

export const updateGalleryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Gallery.findByPk(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Изображение не найдено' });
      return;
    }
    await item.update(req.body);
    res.json({ success: true, data: item, message: 'Запись обновлена' });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Gallery.findByPk(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Изображение не найдено' });
      return;
    }

    // Delete files
    for (const filePath of [item.image, item.thumbnail]) {
      if (filePath) {
        const fullPath = path.join(config.upload.path, 'gallery', path.basename(filePath));
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }

    await item.destroy();
    res.json({ success: true, message: 'Изображение удалено' });
  } catch (error) {
    next(error);
  }
};

export const reorderGallery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { order } = req.body as { order: Array<{ id: number; sortOrder: number }> };

    await Promise.all(
      order.map(({ id, sortOrder }) => Gallery.update({ sortOrder }, { where: { id } }))
    );

    res.json({ success: true, message: 'Порядок обновлён' });
  } catch (error) {
    next(error);
  }
};
