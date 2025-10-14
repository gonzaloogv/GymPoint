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

  it('rechaza check-out cuando no hay check-in', async () => {
    // Crear frecuencia + streak mínimos para cumplir FKs
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const onejan = new Date(weekStart.getFullYear(), 0, 1);
    const week = Math.ceil((((weekStart - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    const freq = await Frequency.create({
      id_user: auth.profile.id_user_profile,
      goal: 3,
      assist: 0,
      achieved_goal: false,
      week_start_date: weekStart.toISOString().slice(0, 10),
      week_number: week,
      year: weekStart.getFullYear()
    });
    const streak = await Streak.create({ id_user: auth.profile.id_user_profile, value: 0, id_frequency: freq.id_frequency, last_value: 0, recovery_items: 0 });

    // Crear asistencia sin check_in_time (simula error legacy)
    const today = new Date().toISOString().slice(0,10);
    const row = await Assistance.create({
      id_user: auth.profile.id_user_profile,
      id_gym: gym.id_gym,
      id_streak: streak.id_streak,
      date: today,
      hour: '10:00:00',
      check_in_time: null
    });

    const res = await request(app)
      .put(`/api/assistances/${row.id_assistance}/checkout`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe('CHECKOUT_FAILED');
  });
});
