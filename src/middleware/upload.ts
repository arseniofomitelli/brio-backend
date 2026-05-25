import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { config } from '../config/config';

type UploadDestination = 'menu' | 'gallery';

const createStorage = (destination: UploadDestination) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(config.upload.path, destination));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
};

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Разрешены только форматы: ${config.upload.allowedTypes.join(', ')}`));
  }
};

export const uploadMenuPhoto = multer({
  storage: createStorage('menu'),
  limits: { fileSize: config.upload.maxSize },
  fileFilter,
}).single('image');

export const uploadGalleryPhoto = multer({
  storage: createStorage('gallery'),
  limits: { fileSize: config.upload.maxSize },
  fileFilter,
}).single('image');
