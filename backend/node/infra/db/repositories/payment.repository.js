/**
 * Payment Repository - Lote 9
 * Data access layer for MercadoPago payments
 */

const { MercadoPagoPayment, Gym, UserProfile } = require('../../../models');
const { toPayment, toPayments } = require('../mappers/payment.mapper');
const { Op } = require('sequelize');

// ============================================================================
// CREATE
// ============================================================================

async function createPayment(payload, options = {}) {
  const payment = await MercadoPagoPayment.create(payload, {
    transaction: options.transaction,
  });
  return toPayment(payment);
}

// ============================================================================
// READ
// ============================================================================

async function findPaymentById(id, options = {}) {
  const payment = await MercadoPagoPayment.findByPk(id, {
    include: options.includeGym ? [{ model: Gym, as: 'gym' }] : [],
    transaction: options.transaction,
  });
  return toPayment(payment);
}

async function findPaymentByMPId(mpPaymentId, options = {}) {
  const payment = await MercadoPagoPayment.findOne({
    where: { payment_id: mpPaymentId },
    transaction: options.transaction,
  });
  return toPayment(payment);
}

async function findPaymentByPreferenceId(preferenceId, options = {}) {
  const payment = await MercadoPagoPayment.findOne({
    where: { preference_id: preferenceId },
    transaction: options.transaction,
  });
  return toPayment(payment);
}

async function findPaymentsForUser(userProfileId, filters = {}, options = {}) {
  const { page = 1, limit = 20, status = null, gymId = null } = filters;
  const offset = (page - 1) * limit;

  const where = { id_user_profile: userProfileId };
  if (status) where.status = status;
  if (gymId !== null) where.id_gym = gymId;

  const { count, rows } = await MercadoPagoPayment.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return {
    items: toPayments(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

async function findPaymentsForGym(gymId, filters = {}, options = {}) {
  const { page = 1, limit = 20, status = null, fromDate = null, toDate = null } = filters;
  const offset = (page - 1) * limit;

  const where = { id_gym: gymId };
  if (status) where.status = status;
  if (fromDate || toDate) {
    where.created_at = {};
    if (fromDate) where.created_at[Op.gte] = new Date(fromDate);
    if (toDate) where.created_at[Op.lte] = new Date(toDate);
  }

  const { count, rows } = await MercadoPagoPayment.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return {
    items: toPayments(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

// ============================================================================
// UPDATE
// ============================================================================

async function updatePaymentStatus(paymentId, updates, options = {}) {
  await MercadoPagoPayment.update(updates, {
    where: { payment_id: paymentId },
    transaction: options.transaction,
  });

  return findPaymentByMPId(paymentId, options);
}

// ============================================================================
// STATS
// ============================================================================

async function getPaymentStats(filters = {}, options = {}) {
  const { gymId = null, fromDate = null, toDate = null } = filters;

  const where = {};
  if (gymId !== null) where.id_gym = gymId;
  if (fromDate || toDate) {
    where.created_at = {};
    if (fromDate) where.created_at[Op.gte] = new Date(fromDate);
    if (toDate) where.created_at[Op.lte] = new Date(toDate);
  }

  const [total, approved, pending, rejected] = await Promise.all([
    MercadoPagoPayment.count({ where, transaction: options.transaction }),
    MercadoPagoPayment.count({ where: { ...where, status: 'APPROVED' }, transaction: options.transaction }),
    MercadoPagoPayment.count({ where: { ...where, status: 'PENDING' }, transaction: options.transaction }),
    MercadoPagoPayment.count({ where: { ...where, status: 'REJECTED' }, transaction: options.transaction }),
  ]);

  const approvedPayments = await MercadoPagoPayment.findAll({
    where: { ...where, status: 'APPROVED' },
    attributes: ['amount'],
    transaction: options.transaction,
  });

  const approvedAmount = approvedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const averageAmount = approved > 0 ? approvedAmount / approved : 0;

  return {
    totalPayments: total,
    totalAmount: approvedAmount,
    approvedPayments: approved,
    approvedAmount,
    pendingPayments: pending,
    rejectedPayments: rejected,
    averageAmount,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  createPayment,
  findPaymentById,
  findPaymentByMPId,
  findPaymentByPreferenceId,
  findPaymentsForUser,
  findPaymentsForGym,
  updatePaymentStatus,
  getPaymentStats,
};
