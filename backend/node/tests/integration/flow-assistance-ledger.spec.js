process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch(_) {}

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const app = require('../../index');

const { Account, UserProfile, AccountRole, Role, Gym, GymGeofence, TokenLedger, Assistance } = require('../../models');

const describeIntegration = process.env.RUN_E2E_FLOW_ASSIST === 'true' ? describe : describe.skip;

describeIntegration('Flujo completo: check-in -> check-out -> tokens (E2E)', () => {
  let secret; let auth; let gym;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();
    secret = process.env.JWT_SECRET || 'test_flow_secret';
    process.env.JWT_SECRET = secret;
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    auth = await buildUser(role);
    gym = await Gym.create({ name: 'FlowGym', description: 'd', city: 'c', address: 'a', latitude: 0, longitude: 0, month_price: 10, week_price: 5 });
    
    // Configurar geofence para permitir auto check-in
    await GymGeofence.create({ 
      id_gym: gym.id_gym, 
      radius_meters: 150, 
      auto_checkin_enabled: true, 
      min_stay_minutes: 1 
    });

    // Nota: autoCheckIn inicializa Frequency+Streak si no existen
  });

  afterAll(async () => {
    await Assistance.destroy({ where: { id_user: auth.profile.id_user_profile } });
    await TokenLedger.destroy({ where: { id_user_profile: auth.profile.id_user_profile } });
    if (gym) await gym.destroy({ force: true });
    await UserProfile.destroy({ where: { id_account: auth.account.id_account } });
    await AccountRole.destroy({ where: { id_account: auth.account.id_account } });
    await Account.destroy({ where: { id_account: auth.account.id_account } });
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `flow-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'Flow', lastname: 'User', gender: 'O', tokens: 0 });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });

    const token = jwt.sign({ id: account.id_account, id_user_profile: profile.id_user_profile, roles: ['USER'] }, secret, { expiresIn: '1h' });
    return { account, profile, token };
  };

  it('registra ledger al check-in y mantiene coherencia tras check-out', async () => {
    const ci = await request(app)
      .post('/api/assistances/auto-checkin')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ id_gym: gym.id_gym, latitude: 0, longitude: 0 });
    expect(ci.status).toBe(201);
    const assistanceId = ci.body?.data?.asistencia?.id_assistance;
    expect(assistanceId).toBeTruthy();

    // Debe existir ledger ref_type 'assistance'
    const ledger = await TokenLedger.findOne({ where: { id_user_profile: auth.profile.id_user_profile, ref_type: 'assistance', ref_id: assistanceId } });
    expect(ledger).toBeTruthy();

    const co = await request(app)
      .put(`/api/assistances/${assistanceId}/checkout`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send();
    expect(co.status).toBe(200);
  });
});
