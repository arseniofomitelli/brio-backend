import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import { User } from '../src/models';
import { UserRole } from '../src/types';

let adminToken: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await User.create({
    email: 'contacts_test@brio-test.com',
    password: 'password123',
    name: 'Contacts Tester',
    role: UserRole.ADMIN,
  });

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'contacts_test@brio-test.com', password: 'password123' });
  adminToken = res.body.data.accessToken;
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/v1/contacts', () => {
  it('returns contacts (auto-creates default if none exist)', async () => {
    const res = await request(app).get('/api/v1/contacts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('phone');
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('workingHours');
  });
});

describe('PUT /api/v1/contacts', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/v1/contacts').send({ phone: '+7-999-000-00-00' });
    expect(res.status).toBe(401);
  });

  it('updates contacts with valid data', async () => {
    const res = await request(app)
      .put('/api/v1/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        phone: '+7 (999) 123-45-67',
        taglineRu: 'Лучшее итальянское кафе',
        instagramUrl: 'https://instagram.com/brio_cafe',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('+7 (999) 123-45-67');
    expect(res.body.data.taglineRu).toBe('Лучшее итальянское кафе');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .put('/api/v1/contacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});
