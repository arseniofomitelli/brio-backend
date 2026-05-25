import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import { User, Category, MenuItem } from '../src/models';
import { UserRole } from '../src/types';

let adminToken: string;
let categoryId: number;
let menuItemId: number;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const user = await User.create({
    email: 'menu_test@brio-test.com',
    password: 'password123',
    name: 'Menu Tester',
    role: UserRole.ADMIN,
  });

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'menu_test@brio-test.com', password: 'password123' });
  adminToken = res.body.data.accessToken;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Menu Categories', () => {
  it('GET /menu/categories returns empty array initially', async () => {
    const res = await request(app).get('/api/v1/menu/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('POST /menu/categories creates a category', async () => {
    const res = await request(app)
      .post('/api/v1/menu/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nameRu: 'Закуски', nameIt: 'Antipasti', slug: 'antipasti', sortOrder: 1 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('antipasti');
    categoryId = res.body.data.id;
  });

  it('POST /menu/categories returns 400 for invalid slug', async () => {
    const res = await request(app)
      .post('/api/v1/menu/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nameRu: 'Тест', nameIt: 'Test', slug: 'Invalid Slug!' });
    expect(res.status).toBe(400);
  });

  it('GET /menu/categories/:id returns the category', async () => {
    const res = await request(app).get(`/api/v1/menu/categories/${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(categoryId);
  });

  it('PUT /menu/categories/:id updates the category', async () => {
    const res = await request(app)
      .put(`/api/v1/menu/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nameRu: 'Закуски обновлено' });
    expect(res.status).toBe(200);
    expect(res.body.data.nameRu).toBe('Закуски обновлено');
  });
});

describe('Menu Items', () => {
  it('POST /menu/items creates a menu item', async () => {
    const res = await request(app)
      .post('/api/v1/menu/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        nameRu: 'Брускетта с томатами',
        nameIt: 'Bruschetta al pomodoro',
        price: 350,
        weight: 120,
        tags: ['vegetarian'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.price).toBe('350.00');
    menuItemId = res.body.data.id;
  });

  it('GET /menu/items returns items', async () => {
    const res = await request(app).get('/api/v1/menu/items');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /menu/items?categoryId filters by category', async () => {
    const res = await request(app).get(`/api/v1/menu/items?categoryId=${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((item: { categoryId: number }) => item.categoryId === categoryId)).toBe(true);
  });

  it('GET /menu/items/:id returns item with category', async () => {
    const res = await request(app).get(`/api/v1/menu/items/${menuItemId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.category).toBeDefined();
  });

  it('DELETE /menu/items/:id removes the item', async () => {
    const res = await request(app)
      .delete(`/api/v1/menu/items/${menuItemId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /menu/categories/:id with items returns 409', async () => {
    // Create item first
    await request(app)
      .post('/api/v1/menu/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoryId, nameRu: 'Тест', nameIt: 'Test', price: 100 });

    const res = await request(app)
      .delete(`/api/v1/menu/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });
});
