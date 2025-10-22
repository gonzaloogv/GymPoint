const { Op, fn, col } = require('sequelize');
const sequelize = require('../../../config/database');
const { GymPayment, Gym, UserProfile } = require('../../../models');
const { toGymPayment, toGymPayments } = require('../mappers/gym-payment.mapper');

const GYM_ASSOC = {
  model: Gym,
  as: 'gym',
  attributes: ['id_gym', 'name', 'city'],
};

const USER_PROFILE_ASSOC = {
  model: UserProfile,
  as: 'userProfile',
  attributes: ['id_user_profile', 'name'],
};

// ============================================================================
// GYM PAYMENT
// ============================================================================

async function findPaymentsByUserId({
  userId,
  filters = {},
  pagination = {},
  sort = {},
  options = {},
}) {
  const where = { id_user_profile: userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.gymId) {
    where.id_gym = filters.gymId;
  }

  if (filters.from_date) {
    where.payment_date = where.payment_date || {};
    where.payment_date[Op.gte] = filters.from_date;
  }

  if (filters.to_date) {
    where.payment_date = where.payment_date || {};
    where.payment_date[Op.lte] = filters.to_date;
  }

  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const { sortBy = 'payment_date', order = 'DESC' } = sort;
  const validSortFields = ['payment_date', 'amount', 'created_at', 'status'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'payment_date';
  const orderDir = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  const { rows, count } = await GymPayment.findAndCountAll({
    where,
    include: [GYM_ASSOC],
    limit,
    offset,
    order: [[orderField, orderDir]],
    transaction: options.transaction,
  });

  return {
    items: toGymPayments(rows),
    total: count,
    page,
    limit,
  };
}

async function findPaymentsByGymId({
  gymId,
  filters = {},
  pagination = {},
  sort = {},
  options = {},
}) {
  const where = { id_gym: gymId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.payment_method) {
    where.payment_method = filters.payment_method;
  }

  if (filters.from_date) {
    where.payment_date = where.payment_date || {};
    where.payment_date[Op.gte] = filters.from_date;
  }

  if (filters.to_date) {
    where.payment_date = where.payment_date || {};
    where.payment_date[Op.lte] = filters.to_date;
  }

  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const { sortBy = 'payment_date', order = 'DESC' } = sort;
  const validSortFields = ['payment_date', 'amount', 'created_at', 'status'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'payment_date';
  const orderDir = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  const { rows, count } = await GymPayment.findAndCountAll({
    where,
    include: [USER_PROFILE_ASSOC],
    limit,
    offset,
    order: [[orderField, orderDir]],
    transaction: options.transaction,
  });

  return {
    items: toGymPayments(rows),
    total: count,
    page,
    limit,
  };
}

async function findPaymentById(paymentId, options = {}) {
  const payment = await GymPayment.findByPk(paymentId, {
    include: [GYM_ASSOC, USER_PROFILE_ASSOC],
    transaction: options.transaction,
  });
  return toGymPayment(payment);
}

async function createPayment(payload, options = {}) {
  const payment = await GymPayment.create(payload, {
    transaction: options.transaction,
  });
  return toGymPayment(payment);
}

async function updatePayment(paymentId, payload, options = {}) {
  await GymPayment.update(payload, {
    where: { id_payment: paymentId },
    transaction: options.transaction,
  });
  return findPaymentById(paymentId, options);
}

async function deletePayment(paymentId, options = {}) {
  return GymPayment.destroy({
    where: { id_payment: paymentId },
    transaction: options.transaction,
  });
}

// ============================================================================
// STATS
// ============================================================================

async function getGymTotalRevenue(gymId, filters = {}, options = {}) {
  const where = {
    id_gym: gymId,
    status: filters.status || 'COMPLETED',
  };

  if (filters.from_date) {
    where.payment_date = where.payment_date || {};
    where.payment_date[Op.gte] = filters.from_date;
  }

  if (filters.to_date) {
    where.payment_date = where.payment_date || {};
    where.payment_date[Op.lte] = filters.to_date;
  }

  const result = await GymPayment.findOne({
    where,
    attributes: [[fn('SUM', col('amount')), 'total_revenue'], [fn('COUNT', col('id_payment')), 'total_payments']],
    transaction: options.transaction,
    raw: true,
  });

  return {
    total_revenue: parseFloat(result?.total_revenue) || 0,
    total_payments: parseInt(result?.total_payments) || 0,
  };
}

async function countPendingPaymentsByUserAndGym(userId, gymId, options = {}) {
  return GymPayment.count({
    where: {
      id_user_profile: userId,
      id_gym: gymId,
      status: 'PENDING',
    },
    transaction: options.transaction,
  });
}

module.exports = {
  findPaymentsByUserId,
  findPaymentsByGymId,
  findPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getGymTotalRevenue,
  countPendingPaymentsByUserAndGym,
};
