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
  Routine,
  RoutineExercise
} = require('../../models');

const describeIntegration = process.env.RUN_E2E_TEMPLATES === 'true' ? describe : describe.skip;

describeIntegration('Rutinas plantilla (E2E)', () => {
  let secret; let auth; let template;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();

    secret = process.env.JWT_SECRET || 'test_templates_secret';
    process.env.JWT_SECRET = secret;

    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    auth = await buildUser(role);

    // Crear rutina plantilla
    template = await Routine.create({
      routine_name: 'Plantilla FUERZA',
      description: 'Rutina base',
      created_by: null,
      is_template: true,
      recommended_for: 'BEGINNER',
      template_order: 1
    });
    // 3 ejercicios mínimos
    await RoutineExercise.create({ id_routine: template.id_routine, id_exercise: 1, series: 3, reps: 12, order: 1 });
    await RoutineExercise.create({ id_routine: template.id_routine, id_exercise: 2, series: 4, reps: 10, order: 2 });
    await RoutineExercise.create({ id_routine: template.id_routine, id_exercise: 3, series: 3, reps: 8, order: 3 });
  });

  afterAll(async () => {
    if (auth?.profile?.id_user_profile) {
      const userRoutines = await Routine.findAll({
        where: { created_by: auth.profile.id_user_profile, is_template: false }
      });
      const routineIds = userRoutines.map((r) => r.id_routine);
      if (routineIds.length) {
        await RoutineExercise.destroy({ where: { id_routine: routineIds } });
        await Routine.destroy({ where: { id_routine: routineIds }, force: true });
      }
    }

    if (template) {
      await RoutineExercise.destroy({ where: { id_routine: template.id_routine } });
      await Routine.destroy({ where: { id_routine: template.id_routine }, force: true });
    }

    if (auth?.account?.id_account) {
      await UserProfile.destroy({ where: { id_account: auth.account.id_account } });
      await AccountRole.destroy({ where: { id_account: auth.account.id_account } });
      await Account.destroy({ where: { id_account: auth.account.id_account } });
    }
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `tpl-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'Tpl', lastname: 'User', gender: 'O' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    const token = jwt.sign({ id: account.id_account, id_user_profile: profile.id_user_profile, roles: ['USER'] }, secret, { expiresIn: '1h' });
    return { account, profile, token };
  };

  it('GET /api/routines/templates devuelve lista', async () => {
    const res = await request(app).get('/api/routines/templates?difficulty=BEGINNER&limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.routines)).toBe(true);
    expect(res.body.routines.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/routines/:id/import crea una copia para el usuario', async () => {
    const res = await request(app)
      .post(`/api/routines/${template.id_routine}/import`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send();
    expect(res.status).toBe(201);
    expect(res.body?.id_routine_copy).toBeDefined();
  });
});

