process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch(_) {}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const app = require('../../index');

const { Account, UserProfile, AccountRole, Role, Assistance, Gym, Frequency, Streak } = require('../../models');

const describeIntegration = process.env.RUN_E2E_ASSIST_GUARD === 'true' ? describe : describe.skip;

describeIntegration('Asistencia - check-out requiere check-in (E2E)', () => {
  let secret; let auth; let gym;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();
    secret = process.env.JWT_SECRET || 'test_assist_secret';
    process.env.JWT_SECRET = secret;
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    auth = await buildUser(role);
    gym = await Gym.create({ name: 'G', description: 'd', city: 'c', address: 'a', latitude: 0, longitude: 0, month_price: 10, week_price: 5 });
  });

  afterAll(async () => {
    await Assistance.destroy({ where: { id_user: auth.profile.id_user_profile } });
    if (gym) await gym.destroy({ force: true });
    await UserProfile.destroy({ where: { id_account: auth.account.id_account } });
    await AccountRole.destroy({ where: { id_account: auth.account.id_account } });
    await Account.destroy({ where: { id_account: auth.account.id_account } });
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `as-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'A', lastname: 'S', gender: 'O' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    const token = jwt.sign({ id: account.id_account, id_user_profile: profile.id_user_profile, roles: ['USER'] }, secret, { expiresIn: '1h' });
    return { account, profile, token };
  };

  it('rechaza check-out cuando la asistencia no existe', async () => {
    const res = await request(app)
      .put('/api/assistances/999999/checkout')
      .set('Authorization', `Bearer ${auth.token}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe('CHECKOUT_FAILED');
    expect(String(res.body?.error?.message || '')).toMatch(/no encontrado/i);
  });
});
