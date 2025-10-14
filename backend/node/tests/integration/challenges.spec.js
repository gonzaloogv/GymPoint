process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch(_) {}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const app = require('../../index');

const {
  Account,
  UserProfile,
  AccountRole,
  Role,
  DailyChallenge,
  UserDailyChallenge,
  TokenLedger
} = require('../../models');

const describeIntegration = process.env.RUN_E2E_CHALLENGES === 'true' ? describe : describe.skip;

describeIntegration('Desafíos diarios (E2E)', () => {
  let secret; let auth;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();

    secret = process.env.JWT_SECRET || 'test_challenge_secret';
    process.env.JWT_SECRET = secret;

    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    auth = await buildUser(role);
  });

  afterAll(async () => {
    if (auth?.account?.id_account) {
      await TokenLedger.destroy({ where: { id_user_profile: auth.profile.id_user_profile } });
      await UserDailyChallenge.destroy({ where: { id_user_profile: auth.profile.id_user_profile } });
      await UserProfile.destroy({ where: { id_account: auth.account.id_account } });
      await AccountRole.destroy({ where: { id_account: auth.account.id_account } });
      await Account.destroy({ where: { id_account: auth.account.id_account } });
    }
    await DailyChallenge.destroy({ where: {} });
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `chal-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'Ch', lastname: 'User', gender: 'O' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    const token = jwt.sign({ id: account.id_account, id_user_profile: profile.id_user_profile, roles: ['USER'] }, secret, { expiresIn: '1h' });
    return { account, profile, token };
  };

  it('GET /api/challenges/today retorna nulo si no hay desafío', async () => {
    await DailyChallenge.destroy({ where: {} });
    const res = await request(app).get('/api/challenges/today').set('Authorization', `Bearer ${auth.token}`);
    expect(res.status).toBe(200);
    expect(res.body.challenge).toBeNull();
  });

  it('flujo básico: crear desafío hoy, leer y completar', async () => {
    // crear desafío de hoy
    const today = new Date();
    const dateStr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0,10);
    const chal = await DailyChallenge.create({
      challenge_date: dateStr,
      title: 'Completa 3 ejercicios',
      description: 'Haz al menos 3',
      challenge_type: 'EXERCISES',
      target_value: 3,
      target_unit: 'ex',
      tokens_reward: 9,
      difficulty: 'MEDIUM',
      is_active: true
    });

    const r1 = await request(app).get('/api/challenges/today').set('Authorization', `Bearer ${auth.token}`);
    expect(r1.status).toBe(200);
    expect(r1.body.challenge).toBeTruthy();
    expect(r1.body.challenge.id_challenge).toBe(chal.id_challenge);

    const up1 = await request(app).put(`/api/challenges/${chal.id_challenge}/progress`).set('Authorization', `Bearer ${auth.token}`).send({ value: 2 });
    expect(up1.status).toBe(200);
    expect(up1.body.completed).toBe(false);
    expect(up1.body.progress).toBe(2);

    const up2 = await request(app).put(`/api/challenges/${chal.id_challenge}/progress`).set('Authorization', `Bearer ${auth.token}`).send({ value: 3 });
    expect(up2.status).toBe(200);
    expect(up2.body.completed).toBe(true);
    expect(up2.body.tokens_earned).toBe(9);
  });
});

