import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models';

const DEFAULT_CONTACT = {
  restaurantName: 'Brio',
  taglineRu: 'Итальянское кафе',
  taglineIt: 'Caffè italiano',
  phone: '+7 (000) 000-00-00',
  email: 'brio.msk@gmail.com',
  address: 'Via Roma, 1',
  addressRu: 'ул. Примерная, 1',
  city: 'Milano',
  workingHours: {
    monday:    { open: '10:00', close: '22:00' },
    tuesday:   { open: '10:00', close: '22:00' },
    wednesday: { open: '10:00', close: '22:00' },
    thursday:  { open: '10:00', close: '22:00' },
    friday:    { open: '10:00', close: '23:00' },
    saturday:  { open: '11:00', close: '23:00' },
    sunday:    { open: '11:00', close: '21:00', closed: false },
  },
};

/**
 * GET /contacts  — публичный
 */
export const getContacts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let contact = await Contact.findOne();

    if (!contact) {
      // Auto-create default on first request
      contact = await Contact.create(DEFAULT_CONTACT);
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /contacts  — только для авторизованных
 */
export const updateContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let contact = await Contact.findOne();

    if (!contact) {
      contact = await Contact.create({ ...DEFAULT_CONTACT, ...req.body });
    } else {
      await contact.update(req.body);
    }

    res.json({ success: true, data: contact, message: 'Контакты обновлены' });
  } catch (error) {
    next(error);
  }
};
