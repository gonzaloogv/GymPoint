const { Op } = require('sequelize');
const { UserProfile, Account } = require('../../../models');
const { toUserProfile, toUserProfiles } = require('../../db/mappers/user-profile.mapper');

/**
 * Crea un nuevo perfil de usuario
 */
async function createUserProfile(payload, options = {}) {
  const profile = await UserProfile.create(payload, {
    transaction: options.transaction,
  });
  return toUserProfile(profile);
}

/**
 * Actualiza un perfil de usuario
 */
async function updateUserProfile(idUserProfile, payload, options = {}) {
  await UserProfile.update(payload, {
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction,
  });

  if (options.returning === false) {
    return null;
  }

  return findById(idUserProfile, options);
}

/**
 * Encuentra un perfil por ID
 */
async function findById(idUserProfile, options = {}) {
  const profile = await UserProfile.findOne({
    where: { id_user_profile: idUserProfile },
    include: options.includeAccount
      ? [
          {
            model: Account,
            as: 'account',
            attributes: ['id_account', 'email', 'auth_provider', 'email_verified'],
          },
        ]
      : undefined,
    transaction: options.transaction,
  });
  return toUserProfile(profile);
}

/**
 * Encuentra un perfil por ID de cuenta
 */
async function findByAccountId(idAccount, options = {}) {
  const profile = await UserProfile.findOne({
    where: { id_account: idAccount },
    include: options.includeAccount
      ? [
          {
            model: Account,
            as: 'account',
            attributes: ['id_account', 'email', 'auth_provider', 'email_verified'],
          },
        ]
      : undefined,
    transaction: options.transaction,
  });
  return toUserProfile(profile);
}

/**
 * Lista perfiles de usuarios con filtros y paginación
 */
async function findAll({ filters = {}, pagination = {}, sort = {}, options = {} }) {
  const where = {};

  // Filtros
  if (filters.subscription) {
    where.app_tier = filters.subscription;
  }

  // Búsqueda por nombre o email
  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filters.search}%` } },
      { lastname: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  // Paginación
  const limit = pagination.limit ?? 20;
  const offset = pagination.offset ?? 0;

  // Ordenamiento
  const order = [[sort.field || 'created_at', sort.direction || 'DESC']];

  const { rows, count } = await UserProfile.findAndCountAll({
    where,
    include: options.includeAccount
      ? [
          {
            model: Account,
            as: 'account',
            attributes: ['id_account', 'email', 'auth_provider'],
          },
        ]
      : undefined,
    limit,
    offset,
    order,
    transaction: options.transaction,
  });

  return {
    rows: toUserProfiles(rows),
    count,
  };
}

/**
 * Incrementa o decrementa los tokens de un usuario
 */
async function updateTokens(idUserProfile, delta, options = {}) {
  const profile = await UserProfile.findByPk(idUserProfile, {
    transaction: options.transaction,
  });

  if (!profile) {
    throw new Error('UserProfile not found');
  }

  const newBalance = (profile.tokens || 0) + delta;

  await profile.update(
    { tokens: Math.max(0, newBalance) },
    { transaction: options.transaction }
  );

  return newBalance;
}

/**
 * Actualiza la suscripción de un usuario
 */
async function updateSubscription(idUserProfile, subscription, premiumDates = {}, options = {}) {
  const payload = {
    app_tier: subscription,
    premium_since: premiumDates.premiumSince,
    premium_expires: premiumDates.premiumExpires,
  };

  return updateUserProfile(idUserProfile, payload, options);
}

module.exports = {
  createUserProfile,
  updateUserProfile,
  findById,
  findByAccountId,
  findAll,
  updateTokens,
  updateSubscription,
};
