import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
}

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}
