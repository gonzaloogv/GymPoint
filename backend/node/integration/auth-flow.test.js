const request = require('supertest');
const bcrypt = require('bcryptjs');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'secret';
process.env.JWT_REFRESH_SECRET = 'refreshsecret';

const app = require('../index');
const sequelize = require('../config/database');
const User = require('../models/User');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const password = await bcrypt.hash('pass', 10);
  await User.create({
    name: 'Test',
    lastname: 'User',
    email: 'test@example.com',
    gender: 'M',
    locality: 'City',
    age: 30,
    password,
    subscription: 'FREE',
    role: 'USER',
  });
});

describe.skip('auth flow', () => {
  let accessToken;
  let refreshToken;
  test('login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pass' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  test('protected route', async () => {
    const res = await request(app)
      .get('/api/gyms/filtro')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ city: 'x' });
    expect(res.status).toBe(200);
  });

  test('refresh rotates token', async () => {
    const res = await request(app).post('/api/auth/refresh-token').send({ token: refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    const resOld = await request(app).post('/api/auth/refresh-token').send({ token: refreshToken });
    expect(resOld.status).toBe(403);
  });

  test('permission denied', async () => {
    const res = await request(app)
      .post('/api/gyms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'G',
        description: 'D',
        city: 'C',
        address: 'A',
        latitude: 0,
        longitude: 0,
        gym_type: 'T',
        equipment: 'E',
        month_price: 10,
        week_price: 5,
      });
    expect(res.status).toBe(403);
  });
});
