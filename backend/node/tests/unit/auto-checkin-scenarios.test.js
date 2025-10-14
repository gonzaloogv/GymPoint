process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch(_) {}

const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const assistanceService = require('../../services/assistance-service');

const { Account, UserProfile, AccountRole, Role, Gym, GymGeofence } = require('../../models');

describe('autoCheckIn scenarios (unit-ish)', () => {
  let user;
  let gym;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    user = await buildUser(role);
    gym = await Gym.create({ name: 'AutoS', description: 'd', city: 'c', address: 'a', latitude: 0, longitude: 0, month_price: 10, week_price: 5 });
    await GymGeofence.create({ id_gym: gym.id_gym, radius_meters: 100, auto_checkin_enabled: true, min_stay_minutes: 1 });
  });

  afterAll(async () => {
    if (gym) await gym.destroy({ force: true });
    await UserProfile.destroy({ where: { id_account: user.account.id_account } });
    await AccountRole.destroy({ where: { id_account: user.account.id_account } });
    await Account.destroy({ where: { id_account: user.account.id_account } });
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `uas-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'UAS', lastname: 'User', gender: 'O' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    return { account, profile };
  };

  it('lanza OUT_OF_RANGE cuando está fuera del radio', async () => {
    await expect(assistanceService.autoCheckIn({
      id_user: user.profile.id_user_profile,
      id_gym: gym.id_gym,
      latitude: 0.002, // ~222 m
      longitude: 0.002,
      accuracy: 10
    })).rejects.toThrow(/OUT_OF_RANGE|rango/);
  });

  it('realiza auto check-in dentro del radio', async () => {
    const res = await assistanceService.autoCheckIn({
      id_user: user.profile.id_user_profile,
      id_gym: gym.id_gym,
      latitude: 0,
      longitude: 0,
      accuracy: 10
    });
    expect(res).toBeTruthy();
    expect(res.asistencia?.id_assistance).toBeDefined();
    expect(res.asistencia?.auto_checkin).toBe(true);
  });

  it('rechaza duplicado de auto check-in el mismo día', async () => {
    await expect(assistanceService.autoCheckIn({
      id_user: user.profile.id_user_profile,
      id_gym: gym.id_gym,
      latitude: 0,
      longitude: 0,
      accuracy: 10
    })).rejects.toThrow(/Ya registraste asistencia hoy/);
  });

  it('rechaza cuando el geofence está deshabilitado', async () => {
    const gym2 = await Gym.create({ name: 'AutoS2', description: 'd', city: 'c', address: 'a', latitude: 0, longitude: 0, month_price: 10, week_price: 5 });
    await GymGeofence.create({ id_gym: gym2.id_gym, radius_meters: 150, auto_checkin_enabled: false, min_stay_minutes: 1 });

    await expect(assistanceService.autoCheckIn({
      id_user: user.profile.id_user_profile,
      id_gym: gym2.id_gym,
      latitude: 0,
      longitude: 0,
      accuracy: 10
    })).rejects.toThrow(/AUTO_CHECKIN_DISABLED|deshabilitado/);

    await Gym.destroy({ where: { id_gym: gym2.id_gym }, force: true });
  });

  it('rechaza por GPS inexacto (accuracy > umbral)', async () => {
    // Aunque falle por accuracy, mantenemos datos consistentes
    const gym3 = await Gym.create({ name: 'AutoS3', description: 'd', city: 'c', address: 'a', latitude: 0, longitude: 0, month_price: 10, week_price: 5 });
    await GymGeofence.create({ id_gym: gym3.id_gym, radius_meters: 150, auto_checkin_enabled: true, min_stay_minutes: 1 });

    await expect(assistanceService.autoCheckIn({
      id_user: user.profile.id_user_profile,
      id_gym: gym3.id_gym,
      latitude: 0,
      longitude: 0,
      accuracy: 1000
    })).rejects.toThrow(/GPS|precisión|accuracy/i);

    await Gym.destroy({ where: { id_gym: gym3.id_gym }, force: true });
  });
});
