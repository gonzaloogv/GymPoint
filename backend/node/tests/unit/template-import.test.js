process.env.NODE_ENV = 'test';
try { const path = require('path'); require('dotenv').config({ path: path.join(__dirname, '../../.env.local') }); } catch(_) {}

const sequelize = require('../../config/database');
const { runMigrations } = require('../../migrate');
const templateService = require('../../services/template-service');

const { Account, UserProfile, AccountRole, Role, Routine, RoutineExercise } = require('../../models');

describe('template-service.importTemplate (unit-ish)', () => {
  let user;
  let tpl;
  let freeUser;
  let freeUser2;

  beforeAll(async () => {
    await sequelize.authenticate();
    await runMigrations();
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    user = await buildUser(role);
    tpl = await Routine.create({ routine_name: 'UNITTPL', description: 'd', created_by: null, is_template: true, recommended_for: 'BEGINNER', template_order: 1 });
    await RoutineExercise.create({ id_routine: tpl.id_routine, id_exercise: 1, series: 3, reps: 12, order: 1 });
  });

  afterAll(async () => {
    if (tpl) await Routine.destroy({ where: { id_routine: tpl.id_routine }, force: true });
    await Routine.destroy({ where: { created_by: user.profile.id_user_profile }, force: true });
    if (freeUser) {
      await UserImportedRoutine.destroy({ where: { id_user_profile: freeUser.profile.id_user_profile } });
      await Routine.destroy({ where: { created_by: freeUser.profile.id_user_profile }, force: true });
      await UserProfile.destroy({ where: { id_account: freeUser.account.id_account } });
      await AccountRole.destroy({ where: { id_account: freeUser.account.id_account } });
      await Account.destroy({ where: { id_account: freeUser.account.id_account } });
    }
    if (freeUser2) {
      await UserImportedRoutine.destroy({ where: { id_user_profile: freeUser2.profile.id_user_profile } });
      await Routine.destroy({ where: { created_by: freeUser2.profile.id_user_profile }, force: true });
      await UserProfile.destroy({ where: { id_account: freeUser2.account.id_account } });
      await AccountRole.destroy({ where: { id_account: freeUser2.account.id_account } });
      await Account.destroy({ where: { id_account: freeUser2.account.id_account } });
    }
    await UserProfile.destroy({ where: { id_account: user.account.id_account } });
    await AccountRole.destroy({ where: { id_account: user.account.id_account } });
    await Account.destroy({ where: { id_account: user.account.id_account } });
  });

  const buildUser = async (role) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `utpl-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'UTPL', lastname: 'User', gender: 'O', subscription: 'PREMIUM' });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    return { account, profile };
  };

  const buildUserWithSubscription = async (role, subscription) => {
    const unique = `${Date.now()}_${Math.floor(Math.random()*100000)}`;
    const account = await Account.create({ email: `utpl-${subscription}-${unique}@ex.com`, password_hash: null, auth_provider: 'local', email_verified: true, is_active: true });
    const profile = await UserProfile.create({ id_account: account.id_account, name: 'UTPL', lastname: 'User', gender: 'O', subscription });
    await AccountRole.create({ id_account: account.id_account, id_role: role.id_role });
    return { account, profile };
  };

  it('importa plantilla y crea copia con ejercicios', async () => {
    const copy = await templateService.importTemplate(user.profile.id_user_profile, tpl.id_routine);
    expect(copy).toBeTruthy();
    expect(copy.id_routine).toBeDefined();
  });

  it('rechaza importación para FREE cuando ya importó 2 rutinas', async () => {
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    freeUser = await buildUserWithSubscription(role, 'FREE');

    // Crear 2 importaciones previas
    const copy1 = await Routine.create({ routine_name: 'C1', description: 'd', created_by: freeUser.profile.id_user_profile, is_template: false });
    const copy2 = await Routine.create({ routine_name: 'C2', description: 'd', created_by: freeUser.profile.id_user_profile, is_template: false });
    await UserImportedRoutine.create({ id_user_profile: freeUser.profile.id_user_profile, id_routine_original: tpl.id_routine, id_routine_copy: copy1.id_routine });
    await UserImportedRoutine.create({ id_user_profile: freeUser.profile.id_user_profile, id_routine_original: tpl.id_routine, id_routine_copy: copy2.id_routine });

    try {
      await templateService.importTemplate(freeUser.profile.id_user_profile, tpl.id_routine);
      throw new Error('should have thrown');
    } catch (e) {
      expect(e.code).toBe('LIMIT_EXCEEDED');
    }
  });

  it('rechaza importación para FREE cuando ya tiene 5 rutinas propias', async () => {
    const [role] = await Role.findOrCreate({ where: { role_name: 'USER' }, defaults: { description: 'rol' } });
    freeUser2 = await buildUserWithSubscription(role, 'FREE');

    for (let i = 0; i < 5; i++) {
      await Routine.create({ routine_name: `OWN${i}`, description: 'd', created_by: freeUser2.profile.id_user_profile, is_template: false });
    }

    try {
      await templateService.importTemplate(freeUser2.profile.id_user_profile, tpl.id_routine);
      throw new Error('should have thrown');
    } catch (e) {
      expect(e.code).toBe('LIMIT_EXCEEDED');
    }
  });

  it('rechaza cuando la rutina no es plantilla', async () => {
    const nonTpl = await Routine.create({ routine_name: 'NOTPL', description: 'd', created_by: null, is_template: false });
    try {
      await templateService.importTemplate(user.profile.id_user_profile, nonTpl.id_routine);
      throw new Error('should have thrown');
    } catch (e) {
      expect(e.code).toBe('NOT_FOUND');
    }
  });
});
