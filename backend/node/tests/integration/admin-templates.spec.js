process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch (_) {}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const app = require('../../index');

const {
  Account,
  AdminProfile,
  AccountRole,
  Role,
  Exercise,
  Routine,
  RoutineExercise
} = require('../../models');

const describeIntegration = process.env.RUN_E2E_ADMIN_TEMPLATES === 'true' ? describe : describe.skip;

describeIntegration('Admin - Plantillas de rutinas (E2E)', () => {
  let secret; let admin;
  let ex1, ex2, ex3;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();
    secret = process.env.JWT_SECRET || 'test_admin_secret';
    process.env.JWT_SECRET = secret;

    // Crear admin
    const [roleAdmin] = await Role.findOrCreate({ where: { role_name: 'ADMIN' }, defaults: { description: 'Administrador' } });
    admin = await buildAdmin(roleAdmin);

    // Asegurar ejercicios base
    ex1 = await Exercise.create({ exercise_name: 'Sentadilla', muscular_group: 'Piernas' }).catch(()=>Exercise.findOne());
    ex2 = await Exercise.create({ exercise_name: 'Press Banca', muscular_group: 'Pecho' }).catch(()=>Exercise.findOne());
    ex3 = await Exercise.create({ exercise_name: 'Remo', muscular_group: 'Espalda' }).catch(()=>Exercise.findOne());
  });

  afterAll(async () => {
    // Limpieza best-effort
    await RoutineExercise.destroy({ where: {} }).catch(()=>{});
    // No forzar borrado de todas las rutinas para evitar FK ajenas del entorno
    if (admin?.account?.id_account) {
      await AdminProfile.destroy({ where: { id_account: admin.account.id_account } });
      await AccountRole.destroy({ where: { id_account: admin.account.id_account } });
      await Account.destroy({ where: { id_account: admin.account.id_account } });
    }
  });

  const buildAdmin = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `admin-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    await AdminProfile.create({ id_account: account.id_account, name: 'Admin', lastname: 'Test' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    const token = jwt.sign({ id: account.id_account, roles: ['ADMIN'] }, secret, { expiresIn: '1h' });
    return { account, token };
  };

  it('POST /api/admin/routines/templates crea una plantilla', async () => {
    const res = await request(app)
      .post('/api/admin/routines/templates')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        routine_name: 'Plantilla Admin',
        description: 'Creada por admin',
        recommended_for: 'BEGINNER',
        template_order: 2,
        exercises: [
          { id_exercise: ex1.id_exercise, series: 3, reps: 12, order: 1 },
          { id_exercise: ex2.id_exercise, series: 3, reps: 10, order: 2 },
          { id_exercise: ex3.id_exercise, series: 3, reps: 8, order: 3 }
        ]
      });
    if (res.status !== 201) {
      // ayuda de depuración si falla
      // eslint-disable-next-line no-console
      console.log('createTemplate error body:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body?.id_routine).toBeDefined();
  });

  it('GET /api/admin/routines/templates lista plantillas', async () => {
    const res = await request(app)
      .get('/api/admin/routines/templates?difficulty=BEGINNER&limit=10')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.templates)).toBe(true);
  });
});
