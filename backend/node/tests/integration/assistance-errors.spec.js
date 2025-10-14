process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch(_) {}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const app = require('../../index');

const { Account, UserProfile, AccountRole, Role, Gym, GymGeofence, Assistance } = require('../../models');

const describeIntegration = process.env.RUN_E2E_ASSIST_ERRORS === 'true' ? describe : describe.skip;

describeIntegration('Asistencia - errores de precisión y geofence (E2E)', () => {
  let secret; let auth; let gym;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();
    secret = process.env.JWT_SECRET || 'test_assist_err_secret';
    process.env.JWT_SECRET = secret;
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    auth = await buildUser(role);
  });

  afterAll(async () => {
    if (gym) await gym.destroy({ force: true });
    await Assistance.destroy({ where: { id_user: auth.profile.id_user_profile } });
    await UserProfile.destroy({ where: { id_account: auth.account.id_account } });
    await AccountRole.destroy({ where: { id_account: auth.account.id_account } });
    await Account.destroy({ where: { id_account: auth.account.id_account } });
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `ae-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'AE', lastname: 'User', gender: 'O' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    const token = jwt.sign({ id: account.id_account, id_user_profile: profile.id_user_profile, roles: ['USER'] }, secret, { expiresIn: '1h' });
    return { account, profile, token };
  };

  it('auto-checkin rechaza GPS inexacto (accuracy > umbral)', async () => {
    gym = await Gym.create({ name: 'GAcc', description: 'd', city: 'c', address: 'a', latitude: 0, longitude: 0, month_price: 10, week_price: 5 });
    await GymGeofence.create({ id_gym: gym.id_gym, radius_meters: 150, auto_checkin_enabled: true, min_stay_minutes: 1 });

    const res = await request(app)
      .post('/api/assistances/auto-checkin')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ id_gym: gym.id_gym, latitude: 0, longitude: 0, accuracy: 1000 });

    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe('AUTO_CHECKIN_FAILED');
    expect(String(res.body?.error?.message || '')).toContain('GPS');
  });

  it('auto-checkin sin geofence devuelve error configurado', async () => {
    const gym2 = await Gym.create({ name: 'GNoGeo', description: 'd', city: 'c', address: 'a', latitude: 0, longitude: 0, month_price: 10, week_price: 5 });

    const res = await request(app)
      .post('/api/assistances/auto-checkin')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ id_gym: gym2.id_gym, latitude: 0, longitude: 0, accuracy: 10 });

    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe('AUTO_CHECKIN_FAILED');
    expect(String(res.body?.error?.message || '')).toContain('Auto check-in no configurado');

    await gym2.destroy({ force: true });
  });
});

