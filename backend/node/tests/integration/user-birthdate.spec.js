process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch(_) {}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const app = require('../../index');

const { Account, UserProfile, AccountRole, Role } = require('../../models');

const describeIntegration = process.env.RUN_E2E_USER_BIRTHDATE === 'true' ? describe : describe.skip;

describeIntegration('Usuario - birth_date en perfil (E2E)', () => {
  let secret; let auth;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();
    secret = process.env.JWT_SECRET || 'test_user_secret';
    process.env.JWT_SECRET = secret;
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    auth = await buildUser(role);
  });

  afterAll(async () => {
    await UserProfile.destroy({ where: { id_account: auth.account.id_account } });
    await AccountRole.destroy({ where: { id_account: auth.account.id_account } });
    await Account.destroy({ where: { id_account: auth.account.id_account } });
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `ub-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'U', lastname: 'B', gender: 'O', birth_date: '2000-01-15' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    const token = jwt.sign({ id: account.id_account, id_user_profile: profile.id_user_profile, roles: ['USER'] }, secret, { expiresIn: '1h' });
    return { account, profile, token };
  };

  it('GET /api/users/me retorna birth_date', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${auth.token}`);
    expect(res.status).toBe(200);
    expect(res.body.birth_date).toBe('2000-01-15');
  });

  it('PUT /api/users/me actualiza birth_date válido y valida rango', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ birth_date: '1995-05-10' });
    expect(res.status).toBe(200);
    expect(res.body.birth_date).toBe('1995-05-10');
  });
});

