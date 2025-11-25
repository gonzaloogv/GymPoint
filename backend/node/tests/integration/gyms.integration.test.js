const request = require('supertest');
const app = require('../../index');
const { sequelize } = require('../../config/database');

/**
 * Tests de integración para el módulo de Gimnasios
 * 
 * Estos tests verifican:
 * - Creación de gimnasios con equipment, rules, amenities
 * - Actualización de gimnasios
 * - Sincronización de datos entre frontend y backend
 * - Validación de campos opcionales
 */

describe('Gyms Integration Tests', () => {
  let authToken;
  let testGymId;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@gympoint.com',
        password: 'admin123',
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.tokens.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/gyms - Crear Gimnasio', () => {
    it('debe crear un gimnasio con todos los campos', async () => {
      const gymData = {
        name: 'Test Gym Integration',
        description: 'Gimnasio de prueba',
        city: 'Resistencia',
        address: 'Av. Test 123',
        latitude: -27.4444,
        longitude: -58.9999,
        phone: '+54 362 4999999',
        email: 'test@gym.com',
        equipment: ['pesas', 'cintas', 'bicicletas'],
        rules: ['No fumar', 'Respetar turnos', 'Limpiar equipos'],
        amenities: [1, 2, 3],
        verified: false,
        featured: false,
        month_price: 15000,
        week_price: 5000,
        auto_checkin_enabled: true,
        geofence_radius_meters: 100,
        min_stay_minutes: 30,
      };

      const response = await request(app)
        .post('/api/gyms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gymData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id_gym');
      expect(response.body.name).toBe(gymData.name);
      expect(response.body.equipment).toEqual(gymData.equipment);
      expect(response.body.rules).toEqual(gymData.rules);
      expect(Array.isArray(response.body.amenities)).toBe(true);

      testGymId = response.body.id_gym;
    });

    it('debe crear un gimnasio sin campos opcionales', async () => {
      const gymData = {
        name: 'Minimal Gym',
        description: 'Gimnasio mínimo',
        city: 'Resistencia',
        address: 'Av. Minimal 456',
        latitude: -27.5555,
        longitude: -58.8888,
        verified: false,
        featured: false,
        month_price: 10000,
        auto_checkin_enabled: false,
        geofence_radius_meters: 50,
        min_stay_minutes: 20,
      };

      const response = await request(app)
        .post('/api/gyms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gymData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(gymData.name);
    });

    it('debe rechazar email inválido', async () => {
      const gymData = {
        name: 'Invalid Email Gym',
        description: 'Test',
        city: 'Test',
        address: 'Test 123',
        latitude: -27.4444,
        longitude: -58.9999,
        email: 'invalid-email',
        verified: false,
        featured: false,
        month_price: 10000,
        auto_checkin_enabled: false,
        geofence_radius_meters: 50,
        min_stay_minutes: 20,
      };

      const response = await request(app)
        .post('/api/gyms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gymData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/gyms/:id - Obtener Gimnasio', () => {
    it('debe obtener un gimnasio con equipment, rules y amenities', async () => {
      const response = await request(app)
        .get(`/api/gyms/${testGymId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id_gym).toBe(testGymId);
      expect(Array.isArray(response.body.equipment)).toBe(true);
      expect(Array.isArray(response.body.rules)).toBe(true);
      expect(Array.isArray(response.body.amenities)).toBe(true);
    });
  });

  describe('PUT /api/gyms/:id - Actualizar Gimnasio', () => {
    it('debe actualizar equipment, rules y amenities', async () => {
      const updateData = {
        name: 'Updated Test Gym',
        description: 'Gimnasio actualizado',
        city: 'Resistencia',
        address: 'Av. Test 123',
        latitude: -27.4444,
        longitude: -58.9999,
        equipment: ['pesas', 'mancuernas', 'barras'],
        rules: ['Regla 1', 'Regla 2'],
        amenities: [1, 2],
        verified: true,
        featured: false,
        month_price: 18000,
        auto_checkin_enabled: true,
        geofence_radius_meters: 100,
        min_stay_minutes: 30,
      };

      const response = await request(app)
        .put(`/api/gyms/${testGymId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.equipment).toEqual(updateData.equipment);
      expect(response.body.rules).toEqual(updateData.rules);
    });

    it('debe permitir vaciar equipment y rules', async () => {
      const updateData = {
        name: 'Test Gym',
        description: 'Test',
        city: 'Resistencia',
        address: 'Av. Test 123',
        latitude: -27.4444,
        longitude: -58.9999,
        equipment: [],
        rules: [],
        amenities: [],
        verified: false,
        featured: false,
        month_price: 15000,
        auto_checkin_enabled: true,
        geofence_radius_meters: 100,
        min_stay_minutes: 30,
      };

      const response = await request(app)
        .put(`/api/gyms/${testGymId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.equipment).toEqual([]);
      expect(response.body.rules).toEqual([]);
    });
  });

  describe('Gym Schedules', () => {
    it('debe crear un horario para el gimnasio', async () => {
      const scheduleData = {
        id_gym: testGymId,
        day_of_week: 1, // Lunes
        opening_time: '08:00:00',
        closing_time: '22:00:00',
      };

      const response = await request(app)
        .post(`/api/gyms/${testGymId}/schedules`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData);

      expect(response.status).toBe(201);
      expect(response.body.day_of_week).toBe(scheduleData.day_of_week);
    });

    it('debe listar horarios del gimnasio', async () => {
      const response = await request(app)
        .get(`/api/gyms/${testGymId}/schedules`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Gym Special Schedules', () => {
    it('debe crear un horario especial', async () => {
      const specialScheduleData = {
        id_gym: testGymId,
        date: '2025-12-25',
        is_closed: true,
        reason: 'Navidad',
      };

      const response = await request(app)
        .post(`/api/gyms/${testGymId}/special-schedules`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(specialScheduleData);

      expect(response.status).toBe(201);
      expect(response.body.is_closed).toBe(true);
      expect(response.body.motive).toBe('Navidad');
    });

    it('debe listar horarios especiales del gimnasio', async () => {
      const response = await request(app)
        .get(`/api/gyms/${testGymId}/special-schedules`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

