const request = require('supertest');
const sequelize = require('../../config/database');
const jwt = require('jsonwebtoken');

describe('Admin Rewards Stats Integration Tests', () => {
  let adminToken;
  const from = '2025-01-01T00:00:00.000Z';
  const to = '2025-12-31T23:59:59.999Z';
  
  beforeAll(async () => {
    // Crear token de admin de prueba
    adminToken = jwt.sign(
      {
        id_account: 1,
        email: 'admin@test.com',
        roles: ['ADMIN']
      },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });
  
  describe('GET /api/admin/rewards/stats', () => {
    it('debe retornar 401 sin token', async () => {
      const res = await request(require('../../index'))
        .get(`/api/admin/rewards/stats?from=${from}&to=${to}`);
      
      expect(res.status).toBe(401);
    });
    
    it('debe retornar 400 sin parámetros from/to', async () => {
      const res = await request(require('../../index'))
        .get('/api/admin/rewards/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('MISSING_PARAMS');
    });
    
    it('debe retornar estadísticas globales exitosamente', async () => {
      const res = await request(require('../../index'))
        .get(`/api/admin/rewards/stats?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('period');
      expect(res.body.data).toHaveProperty('gyms');
      expect(res.body.data).toHaveProperty('summary');
      expect(Array.isArray(res.body.data.gyms)).toBe(true);
    });
  });
  
  describe('GET /api/admin/gyms/:gymId/rewards/summary', () => {
    it('debe retornar 401 sin token', async () => {
      const res = await request(require('../../index'))
        .get(`/api/admin/gyms/1/rewards/summary?from=${from}&to=${to}`);
      
      expect(res.status).toBe(401);
    });
    
    it('debe retornar 400 sin parámetros from/to', async () => {
      const res = await request(require('../../index'))
        .get('/api/admin/gyms/1/rewards/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('MISSING_PARAMS');
    });
    
    it('debe retornar 404 para gimnasio inexistente', async () => {
      const res = await request(require('../../index'))
        .get(`/api/admin/gyms/99999/rewards/summary?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('GYM_NOT_FOUND');
    });
  });
});
