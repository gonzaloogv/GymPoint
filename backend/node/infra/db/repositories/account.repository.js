const {
  Account,
  Role,
  AccountRole,
  UserProfile,
  AdminProfile,
} = require('../../../models');
const { toAccount } = require('../../db/mappers/account.mapper');
const { toRole } = require('../../db/mappers/role.mapper');

const ROLE_ASSOC = {
  model: Role,
  as: 'roles',
  through: { attributes: [] },
};

const USER_PROFILE_ASSOC = {
  model: UserProfile,
  as: 'userProfile',
};

const ADMIN_PROFILE_ASSOC = {
  model: AdminProfile,
  as: 'adminProfile',
};

const buildInclude = (options = {}) => {
  const include = [];
  if (options.includeRoles) include.push(ROLE_ASSOC);
  if (options.includeUserProfile) include.push(USER_PROFILE_ASSOC);
  if (options.includeAdminProfile) include.push(ADMIN_PROFILE_ASSOC);
  return include.length ? include : undefined;
};

async function findByEmail(email, options = {}) {
  const query = {
    where: { email },
    transaction: options.transaction,
  };

  const include = buildInclude(options);
  if (include) query.include = include;

  const account = await Account.findOne(query);
  return toAccount(account);
}

async function findByGoogleId(googleId, options = {}) {
  const query = {
    where: { google_id: googleId },
    transaction: options.transaction,
  };

  const include = buildInclude(options);
  if (include) query.include = include;

  const account = await Account.findOne(query);
  return toAccount(account);
}

async function findById(idAccount, options = {}) {
  const query = {
    where: { id_account: idAccount },
    transaction: options.transaction,
  };

  const include = buildInclude(options);
  if (include) query.include = include;

  const account = await Account.findOne(query);
  return toAccount(account);
}

async function createAccount(payload, options = {}) {
  const account = await Account.create(payload, {
    transaction: options.transaction,
  });
  return toAccount(account);
}

async function updateAccount(idAccount, payload, options = {}) {
  await Account.update(payload, {
    where: { id_account: idAccount },
    transaction: options.transaction,
  });

  if (options.returning === false) {
    return null;
  }

  return findById(idAccount, options);
}

async function updateLastLogin(idAccount, lastLogin, options = {}) {
  return updateAccount(
    idAccount,
    { last_login: lastLogin },
    { ...options, returning: true }
  );
}

async function findRoleByName(roleName, options = {}) {
  const role = await Role.findOne({
    where: { role_name: roleName },
    transaction: options.transaction,
  });
  return toRole(role);
}

async function linkRole(accountId, roleId, options = {}) {
  await AccountRole.findOrCreate({
    where: {
      id_account: accountId,
      id_role: roleId,
    },
    defaults: {
      id_account: accountId,
      id_role: roleId,
    },
    transaction: options.transaction,
  });
}

module.exports = {
  findByEmail,
  findByGoogleId,
  findById,
  createAccount,
  updateAccount,
  updateLastLogin,
  findRoleByName,
  linkRole,
};
