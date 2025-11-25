/**
 * Queries para el dominio Gym Payments (Pagos de Suscripciones)
 *
 * Las Queries son objetos puros (POJOs) que representan una solicitud
 * de lectura de datos. No modifican el estado del sistema.
 *
 * Cobertura:
 * - GymPayment: Registro de pagos de suscripciones a gimnasios
 */

/**
 * Query para listar pagos de un usuario
 *
 * @typedef {Object} ListUserGymPaymentsQuery
 * @property {number} userId - ID del usuario
 * @property {number} [page=1] - Número de página
 * @property {number} [limit=20] - Cantidad por página
 * @property {string} [sortBy='payment_date'] - Campo para ordenar
 * @property {string} [order='DESC'] - Orden (ASC, DESC)
 * @property {string} [status] - Filtrar por estado (PENDING, COMPLETED, FAILED, REFUNDED)
 * @property {number} [gymId] - Filtrar por gimnasio
 * @property {Date} [from_date] - Desde fecha
 * @property {Date} [to_date] - Hasta fecha
 */
class ListUserGymPaymentsQuery {
  constructor({
    userId,
    page = 1,
    limit = 20,
    sortBy = 'payment_date',
    order = 'DESC',
    status = null,
    gymId = null,
    from_date = null,
    to_date = null,
  }) {
    this.userId = userId;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
    this.status = status;
    this.gymId = gymId;
    this.from_date = from_date;
    this.to_date = to_date;
  }
}

/**
 * Query para listar pagos de un gimnasio (admin del gym)
 *
 * @typedef {Object} ListGymPaymentsQuery
 * @property {number} gymId - ID del gimnasio
 * @property {number} [page=1] - Número de página
 * @property {number} [limit=20] - Cantidad por página
 * @property {string} [sortBy='payment_date'] - Campo para ordenar
 * @property {string} [order='DESC'] - Orden
 * @property {string} [status] - Filtrar por estado
 * @property {Date} [from_date] - Desde fecha
 * @property {Date} [to_date] - Hasta fecha
 * @property {string} [payment_method] - Filtrar por método de pago
 */
class ListGymPaymentsQuery {
  constructor({
    gymId,
    page = 1,
    limit = 20,
    sortBy = 'payment_date',
    order = 'DESC',
    status = null,
    from_date = null,
    to_date = null,
    payment_method = null,
  }) {
    this.gymId = gymId;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
    this.status = status;
    this.from_date = from_date;
    this.to_date = to_date;
    this.payment_method = payment_method;
  }
}

/**
 * Query para obtener un pago específico
 *
 * @typedef {Object} GetGymPaymentByIdQuery
 * @property {number} paymentId - ID del pago
 * @property {number} [userId] - ID del usuario (para validación de acceso)
 * @property {number} [gymId] - ID del gimnasio (para validación de acceso)
 */
class GetGymPaymentByIdQuery {
  constructor({ paymentId, userId = null, gymId = null }) {
    this.paymentId = paymentId;
    this.userId = userId;
    this.gymId = gymId;
  }
}

/**
 * Query para obtener estadísticas de pagos de un gimnasio
 *
 * @typedef {Object} GetGymPaymentStatsQuery
 * @property {number} gymId - ID del gimnasio
 * @property {Date} [from_date] - Desde fecha
 * @property {Date} [to_date] - Hasta fecha
 * @property {string} [group_by='month'] - Agrupar por (day, week, month, year)
 */
class GetGymPaymentStatsQuery {
  constructor({
    gymId,
    from_date = null,
    to_date = null,
    group_by = 'month',
  }) {
    this.gymId = gymId;
    this.from_date = from_date;
    this.to_date = to_date;
    this.group_by = group_by;
  }
}

/**
 * Query para obtener total de ingresos de un gimnasio
 *
 * @typedef {Object} GetGymTotalRevenueQuery
 * @property {number} gymId - ID del gimnasio
 * @property {Date} [from_date] - Desde fecha
 * @property {Date} [to_date] - Hasta fecha
 * @property {string} [status='COMPLETED'] - Solo pagos con este estado
 */
class GetGymTotalRevenueQuery {
  constructor({
    gymId,
    from_date = null,
    to_date = null,
    status = 'COMPLETED',
  }) {
    this.gymId = gymId;
    this.from_date = from_date;
    this.to_date = to_date;
    this.status = status;
  }
}

/**
 * Query para verificar si un usuario tiene pagos pendientes a un gym
 *
 * @typedef {Object} HasUserPendingPaymentsQuery
 * @property {number} userId - ID del usuario
 * @property {number} gymId - ID del gimnasio
 */
class HasUserPendingPaymentsQuery {
  constructor({ userId, gymId }) {
    this.userId = userId;
    this.gymId = gymId;
  }
}

module.exports = {
  ListUserGymPaymentsQuery,
  ListGymPaymentsQuery,
  GetGymPaymentByIdQuery,
  GetGymPaymentStatsQuery,
  GetGymTotalRevenueQuery,
  HasUserPendingPaymentsQuery,
};
