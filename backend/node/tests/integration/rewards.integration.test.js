const request = require('supertest');
const app = require('../../index');
const { sequelize } = require('../../config/database');

/**
 * Tests de integración para el módulo de Recompensas
 * 
 * Estos tests verifican:
 * - Creación de recompensas con todos los campos
 * - Actualización de recompensas
 * - Validación de campos requeridos
 * - Sincronización entre frontend y backend
 */

describe('Rewards Integration Tests', () => {
  let authToken;
  let adminUserId;
  let testRewardId;

  // Setup: Autenticar como admin antes de los tests
  beforeAll(async () => {
    // Login como admin
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@gympoint.com',
        password: 'admin123',
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.tokens.accessToken;
    adminUserId = loginResponse.body.user.id;
  });

  // Cleanup: Cerrar conexión después de los tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/rewards - Crear Recompensa', () => {
    it('debe crear una recompensa con todos los campos requeridos', async () => {
      const rewardData = {
        name: 'Test Reward',
        description: 'Recompensa de prueba',
        token_cost: 50,
        stock: 10,
        category: 'merchandise',
        is_active: true,
      };

      const response = await request(app)
        .post('/api/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(rewardData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id_reward');
      expect(response.body.name).toBe(rewardData.name);
      expect(response.body.token_cost).toBe(rewardData.token_cost);
      expect(response.body.is_active).toBe(true);

      testRewardId = response.body.id_reward;
    });

    it('debe crear una recompensa con campos opcionales', async () => {
      const rewardData = {
        name: 'Test Reward with Optional Fields',
        description: 'Recompensa con campos opcionales',
        token_cost: 100,
        stock: 5,
        category: 'discount',
        is_active: true,
        image_url: 'https://example.com/image.jpg',
        terms: 'Términos y condiciones de la recompensa',
      };

      const response = await request(app)
        .post('/api/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(rewardData);

      expect(response.status).toBe(201);
      expect(response.body.image_url).toBe(rewardData.image_url);
      expect(response.body.terms).toBe(rewardData.terms);
    });

    it('debe rechazar recompensa sin campos requeridos', async () => {
      const invalidData = {
        name: 'Invalid Reward',
        // Falta description, token_cost, stock, category
      };

      const response = await request(app)
        .post('/api/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('debe rechazar token_cost negativo', async () => {
      const invalidData = {
        name: 'Invalid Reward',
        description: 'Test',
        token_cost: -10,
        stock: 5,
        category: 'merchandise',
      };

      const response = await request(app)
        .post('/api/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/rewards - Listar Recompensas', () => {
    it('debe listar todas las recompensas activas', async () => {
      const response = await request(app)
        .get('/api/rewards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('debe filtrar recompensas por categoría', async () => {
      const response = await request(app)
        .get('/api/rewards?category=merchandise')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.forEach(reward => {
        expect(reward.category).toBe('merchandise');
      });
    });
  });

  describe('PATCH /api/rewards/:id - Actualizar Recompensa', () => {
    it('debe actualizar una recompensa existente', async () => {
      const updateData = {
        name: 'Updated Test Reward',
        token_cost: 75,
      };

      const response = await request(app)
        .patch(`/api/rewards/${testRewardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.token_cost).toBe(updateData.token_cost);
    });

    it('debe desactivar una recompensa', async () => {
      const response = await request(app)
        .patch(`/api/rewards/${testRewardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ is_active: false });

      expect(response.status).toBe(200);
      expect(response.body.is_active).toBe(false);
    });

    it('debe rechazar actualización de recompensa inexistente', async () => {
      const response = await request(app)
        .patch('/api/rewards/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/rewards/:id - Eliminar Recompensa', () => {
    it('debe eliminar una recompensa', async () => {
      const response = await request(app)
        .delete(`/api/rewards/${testRewardId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('debe rechazar eliminación de recompensa inexistente', async () => {
      const response = await request(app)
        .delete('/api/rewards/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

