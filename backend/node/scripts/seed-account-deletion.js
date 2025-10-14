'use strict';

require('dotenv').config();

const sequelize = require('../config/database');
const {
  Account,
  UserProfile,
  AccountRole,
  Role,
  AccountDeletionRequest
} = require('../models');
const { runAccountDeletionNow } = require('../jobs/account-deletion-job');
const { ACCOUNT_DELETION_STATUS } = require('../config/constants');

const createSeedAccount = async () => {
  const transaction = await sequelize.transaction();
  try {
    const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const email = `seed-deletion-${uniqueSuffix}@example.com`;

    const [userRole] = await Role.findOrCreate({
      where: { role_name: 'USER' },
      defaults: { description: 'Rol de usuario generado por seed' },
      transaction
    });

    const account = await Account.create(
      {
        email,
        password_hash: null,
        auth_provider: 'local',
        email_verified: true,
        is_active: true
      },
      { transaction }
    );

    await UserProfile.create(
      {
        id_account: account.id_account,
        name: 'Seed',
        lastname: 'Deletion',
        gender: 'O',
        locality: 'Seed City'
      },
      { transaction }
    );

    await AccountRole.create(
      {
        id_account: account.id_account,
        id_role: userRole.id_role
      },
      { transaction }
    );

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const scheduledDeletionDate = yesterday.toISOString().slice(0, 10);

    await AccountDeletionRequest.create(
      {
        id_account: account.id_account,
        reason: 'Seeded pending deletion',
        scheduled_deletion_date: scheduledDeletionDate,
        status: ACCOUNT_DELETION_STATUS.PENDING,
        metadata: {
          source: 'seed-script',
          created_at: new Date().toISOString()
        }
      },
      { transaction }
    );

    await transaction.commit();
    return account.id_account;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('[SEED ACCOUNT DELETION] Conexión con base de datos establecida.');

    const accountId = await createSeedAccount();
    console.log(`[SEED ACCOUNT DELETION] Cuenta ${accountId} creada con solicitud pendiente.`);

    const processed = await runAccountDeletionNow();
    console.log(`[SEED ACCOUNT DELETION] Solicitudes procesadas por el job: ${processed}`);
  } catch (error) {
    console.error('[SEED ACCOUNT DELETION] Error:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

main();
