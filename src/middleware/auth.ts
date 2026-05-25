import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthRequest, JwtPayload, UserRole } from '../types';
import { User } from '../models';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Токен авторизации не предоставлен' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const user = await User.findByPk(payload.id);
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Пользователь не найден или неактивен' });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Токен истёк' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Недействительный токен' });
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Не авторизован' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Недостаточно прав' });
      return;
    }
    next();
  };
};
