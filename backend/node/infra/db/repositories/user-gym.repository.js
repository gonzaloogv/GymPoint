/**
 * UserGym Repository - Lote 9
 * Data access layer for user gym subscriptions
 */

const { UserGym, Gym, UserProfile } = require('../../../models');
const { toUserGym, toUserGyms } = require('../mappers/user-gym.mapper');
const { Op } = require('sequelize');

// ============================================================================
// CREATE
// ============================================================================

async function createSubscription(payload, options = {}) {
  const subscription = await UserGym.create(payload, {
    transaction: options.transaction,
  });
  return toUserGym(subscription);
}

// ============================================================================
// READ
// ============================================================================

async function findSubscriptionById(id, options = {}) {
  const subscription = await UserGym.findByPk(id, {
    include: options.includeGym ? [{ model: Gym, as: 'gym' }] : [],
    transaction: options.transaction,
  });
  return toUserGym(subscription);
}

async function findByUserAndGym(userProfileId, gymId, options = {}) {
  const subscription = await UserGym.findOne({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
    },
    include: options.includeGym ? [{ model: Gym, as: 'gym' }] : [],
    transaction: options.transaction,
  });
  return toUserGym(subscription);
}

async function findActiveSubscription(userProfileId, gymId, options = {}) {
  const subscription = await UserGym.findOne({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
      is_active: true,
    },
    include: options.includeGym ? [{ model: Gym, as: 'gym' }] : [],
    transaction: options.transaction,
  });
  return toUserGym(subscription);
}

async function findUserSubscriptions(userProfileId, filters = {}, options = {}) {
  const { page = 1, limit = 20, isActive = null } = filters;
  const offset = (page - 1) * limit;

  const where = { id_user_profile: userProfileId };
  if (isActive !== null) {
    where.is_active = isActive;
  }

  const { count, rows } = await UserGym.findAndCountAll({
    where,
    include: [{ model: Gym, as: 'gym' }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return {
    items: toUserGyms(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

async function findGymMembers(gymId, filters = {}, options = {}) {
  const { page = 1, limit = 20, isActive = null } = filters;
  const offset = (page - 1) * limit;

  const where = { id_gym: gymId };
  if (isActive !== null) {
    where.is_active = isActive;
  }

  const { count, rows } = await UserGym.findAndCountAll({
    where,
    include: [{ model: UserProfile, as: 'userProfile' }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return {
    items: toUserGyms(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

async function countGymMembers(gymId, options = {}) {
  return UserGym.count({
    where: {
      id_gym: gymId,
      is_active: true,
    },
    transaction: options.transaction,
  });
}

async function countActiveSubscriptions(userProfileId, options = {}) {
  return UserGym.count({
    where: {
      id_user_profile: userProfileId,
      is_active: true,
    },
    transaction: options.transaction,
  });
}

async function findExpiringSubscriptions(daysBeforeExpiry = 7, limit = 100, options = {}) {
  const today = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);

  const subscriptions = await UserGym.findAll({
    where: {
      is_active: true,
      subscription_end: {
        [Op.gte]: today,
        [Op.lte]: expiryDate,
      },
    },
    include: [
      { model: Gym, as: 'gym' },
      { model: UserProfile, as: 'userProfile' },
    ],
    limit,
    order: [['subscription_end', 'ASC']],
    transaction: options.transaction,
  });

  return toUserGyms(subscriptions);
}

// ============================================================================
// UPDATE
// ============================================================================

async function updateSubscription(id, updates, options = {}) {
  await UserGym.update(updates, {
    where: { id_user_gym: id },
    transaction: options.transaction,
  });

  return findSubscriptionById(id, options);
}

async function deactivateSubscription(userProfileId, gymId, options = {}) {
  await UserGym.update(
    {
      is_active: false,
      subscription_end: new Date(),
    },
    {
      where: {
        id_user_profile: userProfileId,
        id_gym: gymId,
        is_active: true,
      },
      transaction: options.transaction,
    }
  );
}

async function renewSubscription(id, newEndDate, options = {}) {
  await UserGym.update(
    {
      subscription_end: newEndDate,
      is_active: true,
    },
    {
      where: { id_user_gym: id },
      transaction: options.transaction,
    }
  );

  return findSubscriptionById(id, options);
}

async function markTrialAsUsed(userProfileId, gymId, trialDate, options = {}) {
  // Buscar o crear el registro user_gym
  const [userGym, created] = await UserGym.findOrCreate({
    where: {
      id_user_profile: userProfileId,
      id_gym: gymId,
    },
    defaults: {
      id_user_profile: userProfileId,
      id_gym: gymId,
      trial_used: true,
      trial_date: trialDate,
      is_active: false, // No tiene suscripción activa, solo usó el trial
    },
    transaction: options.transaction,
  });

  // Si ya existía, actualizar
  if (!created && !userGym.trial_used) {
    await UserGym.update(
      {
        trial_used: true,
        trial_date: trialDate,
      },
      {
        where: {
          id_user_profile: userProfileId,
          id_gym: gymId,
        },
        transaction: options.transaction,
      }
    );
  }

  return findByUserAndGym(userProfileId, gymId, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  createSubscription,
  findSubscriptionById,
  findByUserAndGym,
  findActiveSubscription,
  findUserSubscriptions,
  findGymMembers,
  countGymMembers,
  countActiveSubscriptions,
  findExpiringSubscriptions,
  updateSubscription,
  deactivateSubscription,
  renewSubscription,
  markTrialAsUsed,
};
