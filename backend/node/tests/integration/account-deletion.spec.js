process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/database');
const {
  Account,
  UserProfile,
  AccountRole,
  Role,
  AccountDeletionRequest
} = require('../../models');
const { ACCOUNT_DELETION_STATUS } = require('../../config/constants');

const app = require('../../index');

const describeIntegration =
  process.env.RUN_E2E_ACCOUNT_DELETION === 'true' ? describe : describe.skip;

describeIntegration('Account Deletion API (E2E)', () => {
  let secret;
  let userRole;

  beforeAll(async () => {
    await sequelize.authenticate();
    secret = process.env.JWT_SECRET || 'test_e2e_secret';
    process.env.JWT_SECRET = secret;

    const [role] = await Role.findOrCreate({
      where: { role_name: 'USER' },
      defaults: { description: 'Rol de usuario para pruebas E2E' }
    });

    userRole = role;
  });

  const buildAccountFixture = async () => {
    const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const account = await Account.create({
      email: `e2e-user-${uniqueSuffix}@example.com`,
      password_hash: null,
      auth_provider: 'local',
      email_verified: true,
      is_active: true
    });

    const profile = await UserProfile.create({
      id_account: account.id_account,
      name: 'E2E',
      lastname: 'User',
      gender: 'O',
      locality: 'Test City'
    });

    await AccountRole.create({
      id_account: account.id_account,
      id_role: userRole.id_role
    });

    const token = jwt.sign(
      {
        id: account.id_account,
        email: account.email,
        roles: ['USER'],
        id_user_profile: profile.id_user_profile
      },
      secret,
      { expiresIn: '1h' }
    );

    return { account, profile, token };
  };

  const cleanupAccount = async (accountId) => {
    await AccountDeletionRequest.destroy({ where: { id_account: accountId } });
    await AccountRole.destroy({ where: { id_account: accountId } });
    await UserProfile.destroy({ where: { id_account: accountId } });
    await Account.destroy({ where: { id_account: accountId } });
  };

  it('programa, consulta y cancela la eliminación de cuenta', async () => {
    const { account, token } = await buildAccountFixture();

    try {
      const reason = 'E2E schedule';

      const scheduleRes = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason });

      expect(scheduleRes.status).toBe(200);
      expect(scheduleRes.body.request).toBeDefined();
      expect(scheduleRes.body.request.status).toBe(ACCOUNT_DELETION_STATUS.PENDING);

      const pending = await AccountDeletionRequest.findOne({
        where: { id_account: account.id_account }
      });
      expect(pending).not.toBeNull();
      expect(pending.status).toBe(ACCOUNT_DELETION_STATUS.PENDING);
      expect(pending.reason).toBe(reason);

      const statusRes = await request(app)
        .get('/api/users/me/deletion-request')
        .set('Authorization', `Bearer ${token}`);

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.has_active_request).toBe(true);
      expect(statusRes.body.request.status).toBe(ACCOUNT_DELETION_STATUS.PENDING);

      const cancelRes = await request(app)
        .delete('/api/users/me/deletion-request')
        .set('Authorization', `Bearer ${token}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.request.status).toBe(ACCOUNT_DELETION_STATUS.CANCELLED);

      await pending.reload();
      expect(pending.status).toBe(ACCOUNT_DELETION_STATUS.CANCELLED);
      expect(pending.cancelled_at).not.toBeNull();
    } finally {
      await cleanupAccount(account.id_account);
    }
  });

  it('rechaza solicitudes duplicadas mientras existe una pendiente', async () => {
    const { account, token } = await buildAccountFixture();

    try {
      const firstRes = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(firstRes.status).toBe(200);

      const secondRes = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(secondRes.status).toBe(409);
      expect(secondRes.body.error.code).toBe('CONFLICT');
    } finally {
      await cleanupAccount(account.id_account);
    }
  });
});
