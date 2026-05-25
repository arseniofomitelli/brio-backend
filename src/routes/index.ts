import { Router } from 'express';
import authRoutes from './auth';
import menuRoutes from './menu';
import galleryRoutes from './gallery';
import contactsRoutes from './contacts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/gallery', galleryRoutes);
router.use('/contacts', contactsRoutes);

export default router;
