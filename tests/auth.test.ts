import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/config/database';
import { User } from '../src/models';
import { UserRole } from '../src/types';

let adminToken: string;
const testEmail = 'testadmin@brio-test.com';
const testPassword = 'test_password_123';

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await User.create({
    email: testEmail,
    password: testPassword,
    name: 'Test Admin',
    role: UserRole.ADMIN,
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/v1/auth/login', () => {
  it('should return 400 for missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should return tokens for valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).not.toHaveProperty('password');
    adminToken = res.body.data.accessToken;
  });
});

describe('GET /api/v1/auth/me', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return user data with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testEmail);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('should return 400 without refresh token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  it('should return 401 for invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid.token.here' });
    expect(res.status).toBe(401);
  });
});
