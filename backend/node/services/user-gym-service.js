/**
 * UserGym Service - Lote 9 CQRS Refactor
 * Business logic for gym subscriptions using Commands/Queries
 */

const { userGymRepository, gymRepository, userProfileRepository } = require('../infra/db/repositories');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const sequelize = require('../config/database');

// ============================================================================
// HELPERS
// ============================================================================

const VALID_PLANS = new Set(['MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL']);

const calculateEndDate = (subscriptionPlan, startDate = new Date()) => {
  const endDate = new Date(startDate);

  switch (subscriptionPlan) {
    case 'WEEKLY':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'DAILY':
      endDate.setDate(endDate.getDate() + 1);
      break;
    case 'ANNUAL':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case 'MONTHLY':
    default:
      endDate.setMonth(endDate.getMonth() + 1);
      break;
  }

  return endDate;
};

// ============================================================================
// SUBSCRIBE TO GYM
// ============================================================================

async function subscribeToGym(command) {
  const transaction = await sequelize.transaction();

  try {
    // Verify user exists
    const user = await userProfileRepository.findById(command.userProfileId, { transaction });
    if (!user) {
      throw new NotFoundError('Usuario');
    }

    // Verify gym exists
    const gym = await gymRepository.findById(command.gymId, { transaction });
    if (!gym) {
      throw new NotFoundError('Gimnasio');
    }

    // Validate subscription plan
    if (!VALID_PLANS.has(command.subscriptionPlan)) {
      throw new ValidationError('Plan de suscripción inválido');
    }

    // Check if already has active subscription
    const existing = await userGymRepository.findActiveSubscription(
      command.userProfileId,
      command.gymId,
      { transaction }
    );

    if (existing) {
      throw new ConflictError('El usuario ya tiene una suscripción activa en este gimnasio');
    }

    // ⭐ NUEVA VALIDACIÓN: Límite de 2 gimnasios activos
    const activeCount = await userGymRepository.countActiveSubscriptions(
      command.userProfileId,
      { transaction }
    );

    if (activeCount >= 2) {
      throw new ValidationError('No puedes tener más de 2 gimnasios activos simultáneamente. Cancela una suscripción para continuar.');
    }

    // Calculate dates
    const subscriptionStart = command.subscriptionStart ? new Date(command.subscriptionStart) : new Date();
    const subscriptionEnd = command.subscriptionEnd
      ? new Date(command.subscriptionEnd)
      : calculateEndDate(command.subscriptionPlan, subscriptionStart);

    // Create subscription
    const subscription = await userGymRepository.createSubscription({
      id_user_profile: command.userProfileId,
      id_gym: command.gymId,
      subscription_plan: command.subscriptionPlan,
      subscription_start: subscriptionStart,
      subscription_end: subscriptionEnd,
      is_active: true,
    }, { transaction });

    await transaction.commit();
    return subscription;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// UNSUBSCRIBE FROM GYM
// ============================================================================

async function unsubscribeFromGym(command) {
  const transaction = await sequelize.transaction();

  try {
    const subscription = await userGymRepository.findActiveSubscription(
      command.userProfileId,
      command.gymId,
      { transaction }
    );

    if (!subscription) {
      throw new NotFoundError('Suscripción activa');
    }

    await userGymRepository.deactivateSubscription(
      command.userProfileId,
      command.gymId,
      { transaction }
    );

    await transaction.commit();
    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// UPDATE SUBSCRIPTION
// ============================================================================

async function updateSubscription(command) {
  const transaction = await sequelize.transaction();

  try {
    const subscription = await userGymRepository.findSubscriptionById(command.userGymId, { transaction });
    if (!subscription) {
      throw new NotFoundError('Suscripción');
    }

    const updates = {};
    if (command.subscriptionPlan) {
      if (!VALID_PLANS.has(command.subscriptionPlan)) {
        throw new ValidationError('Plan de suscripción inválido');
      }
      updates.subscription_plan = command.subscriptionPlan;
    }
    if (command.subscriptionEnd) {
      updates.subscription_end = new Date(command.subscriptionEnd);
    }
    if (command.isActive !== null && command.isActive !== undefined) {
      updates.is_active = command.isActive;
    }

    const updated = await userGymRepository.updateSubscription(
      command.userGymId,
      updates,
      { transaction }
    );

    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// RENEW SUBSCRIPTION
// ============================================================================

async function renewSubscription(command) {
  const transaction = await sequelize.transaction();

  try {
    const subscription = await userGymRepository.findSubscriptionById(command.userGymId, { transaction });
    if (!subscription) {
      throw new NotFoundError('Suscripción');
    }

    const subscriptionPlan = command.subscriptionPlan || subscription.subscription_plan;
    const startDate = new Date();
    const newEndDate = calculateEndDate(subscriptionPlan, startDate);

    const renewed = await userGymRepository.renewSubscription(
      command.userGymId,
      newEndDate,
      { transaction }
    );

    await transaction.commit();
    return renewed;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// LIST USER SUBSCRIPTIONS
// ============================================================================

async function listUserSubscriptions(query) {
  return userGymRepository.findUserSubscriptions(query.userProfileId, {
    page: query.page,
    limit: query.limit,
    isActive: query.isActive,
  });
}

async function getActiveSubscription(query) {
  return userGymRepository.findActiveSubscription(
    query.userProfileId,
    query.gymId
  );
}

// ============================================================================
// GYM MEMBERS
// ============================================================================

async function listGymMembers(query) {
  return userGymRepository.findGymMembers(query.gymId, {
    page: query.page,
    limit: query.limit,
    isActive: query.isActive,
  });
}

async function countGymMembers(query) {
  return userGymRepository.countGymMembers(query.gymId);
}

// ============================================================================
// EXPIRING SUBSCRIPTIONS
// ============================================================================

async function listExpiringSubscriptions(query) {
  return userGymRepository.findExpiringSubscriptions(
    query.daysBeforeExpiry,
    query.limit
  );
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

const darAltaEnGimnasio = async ({ id_user, id_gym, plan, subscription_start, subscription_end }) => {
  // Map old plan names to new ones
  const PLAN_MAP = {
    MENSUAL: 'MONTHLY',
    SEMANAL: 'WEEKLY',
    ANUAL: 'ANNUAL',
    DIARIO: 'DAILY',
  };

  const normalizedPlan = PLAN_MAP[plan?.toUpperCase()] || 'MONTHLY';

  return subscribeToGym({
    userProfileId: id_user,
    gymId: id_gym,
    subscriptionPlan: normalizedPlan,
    subscriptionStart: subscription_start, // Opcional: permite entrada manual
    subscriptionEnd: subscription_end,     // Opcional: permite entrada manual
  });
};

const darBajaEnGimnasio = async ({ id_user, id_gym }) => {
  return unsubscribeFromGym({
    userProfileId: id_user,
    gymId: id_gym,
  });
};

const obtenerGimnasiosActivos = async (id_user) => {
  const result = await listUserSubscriptions({
    userProfileId: id_user,
    isActive: true,
    page: 1,
    limit: 100,
  });
  return result.items;
};

const obtenerHistorialGimnasiosPorUsuario = async (id_user, active) => {
  const isActive = active === 'true' ? true : active === 'false' ? false : null;
  const result = await listUserSubscriptions({
    userProfileId: id_user,
    isActive,
    page: 1,
    limit: 100,
  });
  return result.items;
};

const obtenerHistorialUsuariosPorGimnasio = async (id_gym, active) => {
  const isActive = active === 'true' ? true : active === 'false' ? false : null;
  const result = await listGymMembers({
    gymId: parseInt(id_gym, 10),
    isActive,
    page: 1,
    limit: 100,
  });
  return result.items;
};

const contarUsuariosActivosEnGimnasio = async (id_gym) => {
  return countGymMembers({ gymId: parseInt(id_gym, 10) });
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // CQRS API
  subscribeToGym,
  unsubscribeFromGym,
  updateSubscription,
  renewSubscription,
  listUserSubscriptions,
  getActiveSubscription,
  listGymMembers,
  countGymMembers,
  listExpiringSubscriptions,

  // Legacy compatibility
  darAltaEnGimnasio,
  darBajaEnGimnasio,
  obtenerGimnasiosActivos,
  obtenerHistorialGimnasiosPorUsuario,
  obtenerHistorialUsuariosPorGimnasio,
  contarUsuariosActivosEnGimnasio,
};
