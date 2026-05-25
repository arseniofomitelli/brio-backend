import { Request, Response, NextFunction } from 'express';
import { ValidationError as SequelizeValidationError, UniqueConstraintError } from 'sequelize';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg })),
    });
    return;
  }
  next();
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Маршрут ${req.originalUrl} не найден` });
};

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack, url: req.originalUrl });

  if (err instanceof UniqueConstraintError) {
    res.status(409).json({ success: false, message: 'Запись с такими данными уже существует' });
    return;
  }

  if (err instanceof SequelizeValidationError) {
    res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: err.errors.map((e) => ({ field: e.path || 'unknown', message: e.message })),
    });
    return;
  }

  if (err.message.includes('Разрешены только форматы')) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : err.message,
  });
};
