import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models';
import { AuthRequest, JwtPayload, UserRole } from '../types';
import { logger } from '../utils/logger';

const generateTokens = (payload: Omit<JwtPayload, 'iat' | 'exp'>) => {
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Неверный email или пароль' });
      return;
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Неверный email или пароль' });
      return;
    }

    await user.update({ lastLoginAt: new Date() });

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    logger.info(`User ${user.email} logged in`);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Обновить токен
 *     tags: [Auth]
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, message: 'Refresh token не предоставлен' });
      return;
    }

    const payload = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    const user = await User.findByPk(payload.id);

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Пользователь не найден' });
      return;
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenPayload);

    res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Недействительный refresh token' });
    } else {
      next(error);
    }
  }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id);
    res.json({ success: true, data: user?.toJSON() });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Изменить пароль
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user!.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'Пользователь не найден' });
      return;
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Неверный текущий пароль' });
      return;
    }

    await user.update({ password: newPassword });
    res.json({ success: true, message: 'Пароль успешно изменён' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Список администраторов (только для admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
export const listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: users.map((u) => u.toJSON()) });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/users:
 *   post:
 *     summary: Создать пользователя (только для admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role: role || UserRole.MANAGER,
    });
    res.status(201).json({ success: true, data: user.toJSON() });
  } catch (error) {
    next(error);
  }
};
