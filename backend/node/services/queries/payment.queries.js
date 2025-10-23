/**
 * Payment Queries - Lote 9
 * Consultas para operaciones de lectura en pagos de MercadoPago
 */

// ============================================================================
// MERCADOPAGO PAYMENT QUERIES
// ============================================================================

/**
 * GetPaymentByIdQuery
 * Obtiene un pago por su ID de base de datos
 */
class GetPaymentByIdQuery {
  constructor({ paymentId }) {
    this.paymentId = paymentId;
  }
}

/**
 * GetPaymentByMPIdQuery
 * Obtiene un pago por su payment_id de MercadoPago
 */
class GetPaymentByMPIdQuery {
  constructor({ mpPaymentId }) {
    this.mpPaymentId = mpPaymentId;
  }
}

/**
 * ListPaymentsForUserQuery
 * Lista los pagos de un usuario con paginación
 */
class ListPaymentsForUserQuery {
  constructor({
    userProfileId,
    page = 1,
    limit = 20,
    status = null,
    gymId = null,
  }) {
    this.userProfileId = userProfileId;
    this.page = page;
    this.limit = limit;
    this.status = status;
    this.gymId = gymId;
  }
}

/**
 * ListPaymentsForGymQuery
 * Lista los pagos de un gimnasio con paginación
 */
class ListPaymentsForGymQuery {
  constructor({
    gymId,
    page = 1,
    limit = 20,
    status = null,
    fromDate = null,
    toDate = null,
  }) {
    this.gymId = gymId;
    this.page = page;
    this.limit = limit;
    this.status = status;
    this.fromDate = fromDate;
    this.toDate = toDate;
  }
}

/**
 * GetPaymentStatsQuery
 * Obtiene estadísticas de pagos para un gimnasio
 */
class GetPaymentStatsQuery {
  constructor({
    gymId = null,
    fromDate = null,
    toDate = null,
  }) {
    this.gymId = gymId;
    this.fromDate = fromDate;
    this.toDate = toDate;
  }
}

module.exports = {
  GetPaymentByIdQuery,
  GetPaymentByMPIdQuery,
  ListPaymentsForUserQuery,
  ListPaymentsForGymQuery,
  GetPaymentStatsQuery,
};
