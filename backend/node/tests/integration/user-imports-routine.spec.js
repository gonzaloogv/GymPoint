process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch(_) {}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const app = require('../../index');

const { Account, UserProfile, AccountRole, Role, Routine, UserImportedRoutine } = require('../../models');

const describeIntegration = process.env.RUN_E2E_IMPORT_VIEW === 'true' ? describe : describe.skip;

describeIntegration('Importar rutina y ver en /me (E2E)', () => {
  let secret; let auth; let template;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();
    secret = process.env.JWT_SECRET || 'test_import_secret';
    process.env.JWT_SECRET = secret;
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    auth = await buildUser(role);
    template = await Routine.create({ routine_name: 'TPL', description: 'd', created_by: null, is_template: true, recommended_for: 'BEGINNER', template_order: 1 });
  });

  afterAll(async () => {
    await UserImportedRoutine.destroy({ where: { id_user_profile: auth.profile.id_user_profile } });
    await Routine.destroy({ where: { is_template: false, created_by: auth.profile.id_user_profile }, force: true });
    if (template) await Routine.destroy({ where: { id_routine: template.id_routine }, force: true });
    await UserProfile.destroy({ where: { id_account: auth.account.id_account } });
    await AccountRole.destroy({ where: { id_account: auth.account.id_account } });
    await Account.destroy({ where: { id_account: auth.account.id_account } });
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `uv-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'U', lastname: 'V', gender: 'O', subscription: 'PREMIUM' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    const token = jwt.sign({ id: account.id_account, id_user_profile: profile.id_user_profile, roles: ['USER'] }, secret, { expiresIn: '1h' });
    return { account, profile, token };
  };

  it('importa la plantilla y aparece en GET /api/routines/me', async () => {
    const imp = await request(app).post(`/api/routines/${template.id_routine}/import`).set('Authorization', `Bearer ${auth.token}`).send();
    expect(imp.status).toBe(201);

    const list = await request(app).get('/api/routines/me').set('Authorization', `Bearer ${auth.token}`);
    expect(list.status).toBe(200);
    const hasImported = (list.body?.data || []).some(r => r.routine_name === 'TPL');
    expect(hasImported).toBe(true);
  });
});

