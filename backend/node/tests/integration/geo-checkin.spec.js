process.env.NODE_ENV = 'test';
// Cargar variables locales si existen
try {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
} catch (_) {
  // ignore
}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');

const {
  Account,
  UserProfile,
  AccountRole,
  Role,
  Streak,
  Frequency,
  Gym,
  Assistance,
  TokenLedger
} = require('../../models');

const app = require('../../index');

const describeIntegration = process.env.RUN_E2E_GEOFENCE === 'true' ? describe : describe.skip;

describeIntegration('Geolocalización y Auto Check-in (E2E)', () => {
  let secret;
  let userRole;
  let auth;
  let gym;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();

    secret = process.env.JWT_SECRET || 'test_geo_secret';
    process.env.JWT_SECRET = secret;

    const [role] = await Role.findOrCreate({
      where: { role_name: 'USER' },
      defaults: { description: 'Rol de usuario app' }
    });
    userRole = role;

    auth = await buildUserFixture(role);

    gym = await Gym.create({
      name: 'E2E Gym',
      description: 'Gym for e2e geofence tests',
      city: 'TestCity',
      address: '123 Test St',
      latitude: -34.603722,
      longitude: -58.38159,
      phone: '000',
      month_price: 1000,
      week_price: 400,
      auto_checkin_enabled: true,
      geofence_radius_meters: 200,
      min_stay_minutes: 1
    });
  });

  afterAll(async () => {
    // Cleanup (best-effort)
    if (auth?.profile?.id_user_profile) {
      await Assistance.destroy({ where: { id_user: auth.profile.id_user_profile } });
      await TokenLedger.destroy({ where: { id_user_profile: auth.profile.id_user_profile } });
      await Streak.destroy({ where: { id_user: auth.profile.id_user_profile } });
      await Frequency.destroy({ where: { id_user: auth.profile.id_user_profile } });
    }
    if (gym) {
      await Gym.destroy({ where: { id_gym: gym.id_gym }, force: true });
    }
    if (auth?.account?.id_account) {
      await AccountRole.destroy({ where: { id_account: auth.account.id_account } });
      await UserProfile.destroy({ where: { id_account: auth.account.id_account } });
      await Account.destroy({ where: { id_account: auth.account.id_account } });
    }
  });

  const buildUserFixture = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const account = await Account.create({
      email: `geo-user-${unique}@example.com`,
      password_hash: null,
      auth_provider: 'local',
      email_verified: true,
      is_active: true
    });

    const profile = await UserProfile.create({
      id_account: account.id_account,
      name: 'Geo',
      lastname: 'User',
      gender: 'O',
      locality: 'TestCity',
      tokens: 0
    });

    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });

    // Frequency + Streak inicial
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Lunes
    const year = weekStart.getFullYear();
    // Week number simple (aprox) solo para cumplir NOT NULL; precisión no crítica en test
    const onejan = new Date(weekStart.getFullYear(), 0, 1);
    const week = Math.ceil((((weekStart - onejan) / 86400000) + onejan.getDay() + 1) / 7);

    const freq = await Frequency.create({
      id_user: profile.id_user_profile,
      goal: 3,
      assist: 0,
      achieved_goal: false,
      week_start_date: weekStart.toISOString().slice(0, 10),
      week_number: week,
      year
    });

    const streak = await Streak.create({
      id_user: profile.id_user_profile,
      value: 0,
      id_frequency: freq.id_frequency,
      last_value: 0,
      recovery_items: 0
    });

    await profile.update({ id_streak: streak.id_streak });

    const token = jwt.sign({
      id: account.id_account,
      email: account.email,
      roles: ['USER'],
      id_user_profile: profile.id_user_profile
    }, secret, { expiresIn: '1h' });

    return { account, profile, token };
  };

  it('POST /api/assistances/auto-checkin crea asistencia y tokens base', async () => {
    const res = await request(app)
      .post('/api/assistances/auto-checkin')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ id_gym: gym.id_gym, latitude: gym.latitude, longitude: gym.longitude });

    expect(res.status).toBe(201);
    expect(res.body?.data?.asistencia?.id_assistance).toBeDefined();
    expect(typeof res.body?.data?.distancia).toBe('number');
  });

  it('PUT /api/assistances/:id/checkout registra salida y retorna duración', async () => {
    // Asegurar que no haya asistencia previa del día
    await Assistance.destroy({ where: { id_user: auth.profile.id_user_profile } });
    // Crear asistencia previa (auto-checkin)
    const create = await request(app)
      .post('/api/assistances/auto-checkin')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ id_gym: gym.id_gym, latitude: gym.latitude, longitude: gym.longitude });

    const assistanceId = create.body?.data?.asistencia?.id_assistance;
    expect(assistanceId).toBeTruthy();

    const res = await request(app)
      .put(`/api/assistances/${assistanceId}/checkout`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body?.data?.duration_minutes).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/location/update retorna nearby_gyms', async () => {
    const res = await request(app)
      .post('/api/location/update')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ latitude: gym.latitude, longitude: gym.longitude, accuracy: 10, radiusKm: 5 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.nearby_gyms)).toBe(true);
  });

  it('GET /api/gyms/nearby funciona como alias', async () => {
    const res = await request(app)
      .get(`/api/gyms/nearby?lat=${gym.latitude}&lng=${gym.longitude}&radius=2`)
      .send();

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.meta?.center?.lat).toBeDefined();
  });
});
