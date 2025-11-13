/**
 * Gym Payment Service - Lote 4
 * Maneja pagos de gimnasios usando Commands/Queries
 */

const sequelize = require('../config/database');
const {
  gymPaymentRepository,
  gymRepository,
  userProfileRepository,
} = require('../infra/db/repositories');
const { NotFoundError, ValidationError } = require('../utils/errors');

// ============================================================================
// GYM PAYMENTS
// ============================================================================

/**
 * Lista los pagos de un usuario
 * @param {GetUserPaymentsQuery} query
 * @returns {Promise<Object>} Paginación de pagos
 */
async function getUserPayments(query) {
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.gymId) filters.gymId = query.gymId;
  if (query.from_date) filters.from_date = query.from_date;
  if (query.to_date) filters.to_date = query.to_date;

  const pagination = {
    page: query.page || 1,
    limit: query.limit || 20,
  };

  const sort = {
    sortBy: query.sortBy || 'payment_date',
    order: query.order || 'DESC',
  };

  return gymPaymentRepository.findPaymentsByUserId({
    userId: query.userId,
    filters,
    pagination,
    sort,
  });
}

/**
 * Lista los pagos de un gimnasio
 * @param {GetGymPaymentsQuery} query
 * @returns {Promise<Object>} Paginación de pagos
 */
async function getGymPayments(query) {
  // Verificar que el gimnasio existe
  const gym = await gymRepository.findGymById(query.gymId);
  if (!gym) {
    throw new NotFoundError('Gimnasio no encontrado');
  }

  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.payment_method) filters.payment_method = query.payment_method;
  if (query.from_date) filters.from_date = query.from_date;
  if (query.to_date) filters.to_date = query.to_date;

  const pagination = {
    page: query.page || 1,
    limit: query.limit || 20,
  };

  const sort = {
    sortBy: query.sortBy || 'payment_date',
    order: query.order || 'DESC',
  };

  return gymPaymentRepository.findPaymentsByGymId({
    gymId: query.gymId,
    filters,
    pagination,
    sort,
  });
}

/**
 * Obtiene un pago específico
 * @param {GetGymPaymentQuery} query
 * @returns {Promise<Object|null>} Pago (POJO)
 */
async function getGymPayment(query) {
  return gymPaymentRepository.findPaymentById(query.paymentId);
}

/**
 * Crea un nuevo pago
 * @param {CreateGymPaymentCommand} command
 * @returns {Promise<Object>} Pago creado (POJO)
 */
async function createGymPayment(command) {
  const transaction = await sequelize.transaction();
  try {
    // Validar que el gimnasio existe
    const gym = await gymRepository.findGymById(command.gymId, { transaction });
    if (!gym) {
      throw new NotFoundError('Gimnasio no encontrado');
    }

    // Validar que el usuario existe
    const user = await userProfileRepository.findProfileById(command.userId, { transaction });
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Validar el monto
    if (command.amount <= 0) {
      throw new ValidationError('El monto debe ser mayor a 0');
    }

    const payload = {
      id_user_profile: command.userId,
      id_gym: command.gymId,
      amount: command.amount,
      payment_method: command.payment_method,
      payment_date: command.payment_date,
      period_start: command.period_start,
      period_end: command.period_end,
      status: command.status || 'PENDING',
      reference_number: command.reference_number,
      notes: command.notes,
    };

    const payment = await gymPaymentRepository.createPayment(payload, { transaction });
    await transaction.commit();
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Actualiza un pago
 * @param {UpdateGymPaymentCommand} command
 * @returns {Promise<Object>} Pago actualizado (POJO)
 */
async function updateGymPayment(command) {
  const transaction = await sequelize.transaction();
  try {
    const payment = await gymPaymentRepository.findPaymentById(command.paymentId, { transaction });
    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    const payload = {};
    if (command.status !== undefined) payload.status = command.status;
    if (command.payment_method !== undefined) payload.payment_method = command.payment_method;
    if (command.payment_date !== undefined) payload.payment_date = command.payment_date;
    if (command.amount !== undefined) {
      if (command.amount <= 0) {
        throw new ValidationError('El monto debe ser mayor a 0');
      }
      payload.amount = command.amount;
    }
    if (command.period_start !== undefined) payload.period_start = command.period_start;
    if (command.period_end !== undefined) payload.period_end = command.period_end;
    if (command.reference_number !== undefined) payload.reference_number = command.reference_number;
    if (command.notes !== undefined) payload.notes = command.notes;

    const updated = await gymPaymentRepository.updatePayment(
      command.paymentId,
      payload,
      { transaction }
    );

    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Elimina un pago
 * @param {DeleteGymPaymentCommand} command
 * @returns {Promise<number>} Número de registros eliminados
 */
async function deleteGymPayment(command) {
  const transaction = await sequelize.transaction();
  try {
    const payment = await gymPaymentRepository.findPaymentById(command.paymentId, { transaction });
    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    const deleted = await gymPaymentRepository.deletePayment(command.paymentId, { transaction });
    await transaction.commit();
    return deleted;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// PAYMENT STATS
// ============================================================================

/**
 * Obtiene los ingresos totales de un gimnasio
 * @param {GetGymTotalRevenueQuery} query
 * @returns {Promise<Object>} Estadísticas de ingresos
 */
async function getGymTotalRevenue(query) {
  // Verificar que el gimnasio existe
  const gym = await gymRepository.findGymById(query.gymId);
  if (!gym) {
    throw new NotFoundError('Gimnasio no encontrado');
  }

  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.from_date) filters.from_date = query.from_date;
  if (query.to_date) filters.to_date = query.to_date;

  return gymPaymentRepository.getGymTotalRevenue(query.gymId, filters);
}

/**
 * Cuenta los pagos pendientes de un usuario en un gimnasio
 * @param {CountPendingPaymentsQuery} query
 * @returns {Promise<number>} Cantidad de pagos pendientes
 */
async function countPendingPayments(query) {
  return gymPaymentRepository.countPendingPaymentsByUserAndGym(
    query.userId,
    query.gymId
  );
}

module.exports = {
  // Payments
  getUserPayments,
  getGymPayments,
  getGymPayment,
  createGymPayment,
  updateGymPayment,
  deleteGymPayment,

  // Stats
  getGymTotalRevenue,
  countPendingPayments,
};
