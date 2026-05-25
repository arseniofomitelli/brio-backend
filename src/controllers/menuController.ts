import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Op } from 'sequelize';
import { Category, MenuItem } from '../models';
import { config } from '../config/config';

// ─── CATEGORIES ────────────────────────────────────────────────────────────────

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const where = includeInactive ? {} : { isActive: true };

    const categories = await Category.findAll({
      where,
      include: [{ model: MenuItem, as: 'menuItems', where: { isAvailable: true }, required: false }],
      order: [['sortOrder', 'ASC'], ['nameRu', 'ASC']],
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: MenuItem, as: 'menuItems', order: [['sortOrder', 'ASC']] }],
    });

    if (!category) {
      res.status(404).json({ success: false, message: 'Категория не найдена' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          where: { isAvailable: true },
          required: false,
          order: [['sortOrder', 'ASC']],
        },
      ],
    });

    if (!category) {
      res.status(404).json({ success: false, message: 'Категория не найдена' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category, message: 'Категория создана' });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Категория не найдена' });
      return;
    }
    await category.update(req.body);
    res.json({ success: true, data: category, message: 'Категория обновлена' });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: MenuItem, as: 'menuItems' }],
    });

    if (!category) {
      res.status(404).json({ success: false, message: 'Категория не найдена' });
      return;
    }

    if (category.menuItems && category.menuItems.length > 0) {
      res.status(409).json({
        success: false,
        message: `Нельзя удалить категорию: в ней есть ${category.menuItems.length} блюд`,
      });
      return;
    }

    if (category.image) {
      const imagePath = path.join(config.upload.path, 'menu', path.basename(category.image));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await category.destroy();
    res.json({ success: true, message: 'Категория удалена' });
  } catch (error) {
    next(error);
  }
};

export const uploadCategoryImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Файл не загружен' });
      return;
    }

    const category = await Category.findByPk(req.params.id);
    if (!category) {
      fs.unlinkSync(req.file.path);
      res.status(404).json({ success: false, message: 'Категория не найдена' });
      return;
    }

    // Remove old image
    if (category.image) {
      const oldPath = path.join(config.upload.path, 'menu', path.basename(category.image));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Optimize image with sharp
    const optimizedName = `opt_${req.file.filename}`;
    const optimizedPath = path.join(config.upload.path, 'menu', optimizedName);
    await sharp(req.file.path).resize(800, 600, { fit: 'cover' }).webp({ quality: 85 }).toFile(optimizedPath);
    fs.unlinkSync(req.file.path);

    const imageUrl = `/uploads/menu/${optimizedName}`;
    await category.update({ image: imageUrl });

    res.json({ success: true, data: { image: imageUrl }, message: 'Изображение загружено' });
  } catch (error) {
    next(error);
  }
};

// ─── MENU ITEMS ─────────────────────────────────────────────────────────────────

export const getMenuItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      categoryId,
      isAvailable,
      isSpecial,
      search,
      page = 1,
      limit = 50,
      tag,
    } = req.query;

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
    if (isSpecial !== undefined) where.isSpecial = isSpecial === 'true';
    if (search) {
      where[Op.or as unknown as string] = [
        { nameRu: { [Op.iLike]: `%${search}%` } },
        { nameIt: { [Op.iLike]: `%${search}%` } },
        { descriptionRu: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (tag) {
      where.tags = { [Op.contains]: [tag] };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

    const { count, rows } = await MenuItem.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'nameRu', 'nameIt', 'slug'] }],
      order: [['sortOrder', 'ASC'], ['nameRu', 'ASC']],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await MenuItem.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }],
    });

    if (!item) {
      res.status(404).json({ success: false, message: 'Блюдо не найдено' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const getSpecials = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await MenuItem.findAll({
      where: { isSpecial: true, isAvailable: true },
      include: [{ model: Category, as: 'category', attributes: ['id', 'nameRu', 'nameIt', 'slug'] }],
      order: [['sortOrder', 'ASC']],
    });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await Category.findByPk(req.body.categoryId);
    if (!category) {
      res.status(404).json({ success: false, message: 'Категория не найдена' });
      return;
    }
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item, message: 'Блюдо добавлено' });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Блюдо не найдено' });
      return;
    }
    await item.update(req.body);
    res.json({ success: true, data: item, message: 'Блюдо обновлено' });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Блюдо не найдено' });
      return;
    }

    if (item.image) {
      const imagePath = path.join(config.upload.path, 'menu', path.basename(item.image));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await item.destroy();
    res.json({ success: true, message: 'Блюдо удалено' });
  } catch (error) {
    next(error);
  }
};

export const uploadMenuItemPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Файл не загружен' });
      return;
    }

    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      fs.unlinkSync(req.file.path);
      res.status(404).json({ success: false, message: 'Блюдо не найдено' });
      return;
    }

    // Remove old image
    if (item.image) {
      const oldPath = path.join(config.upload.path, 'menu', path.basename(item.image));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Optimize with sharp: full + thumbnail
    const baseName = req.file.filename.replace(path.extname(req.file.filename), '');
    const optimizedName = `${baseName}.webp`;
    const thumbName = `thumb_${baseName}.webp`;

    await sharp(req.file.path)
      .resize(600, 450, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(path.join(config.upload.path, 'menu', optimizedName));

    await sharp(req.file.path)
      .resize(200, 150, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(path.join(config.upload.path, 'menu', thumbName));

    fs.unlinkSync(req.file.path);

    const imageUrl = `/uploads/menu/${optimizedName}`;
    await item.update({ image: imageUrl });

    res.json({
      success: true,
      data: { image: imageUrl, thumbnail: `/uploads/menu/${thumbName}` },
      message: 'Фото загружено',
    });
  } catch (error) {
    next(error);
  }
};
