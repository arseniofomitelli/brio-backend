import request from 'supertest';
import app from '../src/app';

describe('Health Check', () => {
  it('GET /health returns 200 with service info', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'Brio Cafe API',
    });
  });
});
