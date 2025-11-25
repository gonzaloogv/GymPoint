/**
 * Commands para el dominio Gym Payments (Pagos de Suscripciones a Gimnasios)
 *
 * Los Commands son objetos puros (POJOs) que representan una intención
 * de modificar el estado del sistema. No contienen lógica de negocio.
 *
 * Cobertura:
 * - GymPayment: Registro de pagos de suscripciones a gimnasios
 * - Diferente de MercadoPagoPayment (pagos de suscripción premium app)
 */

/**
 * Command para registrar un pago de suscripción a gimnasio
 *
 * Reglas:
 * - Usuario autenticado
 * - Gym debe existir
 * - Amount > 0
 * - Estado inicial: PENDING
 *
 * @typedef {Object} CreateGymPaymentCommand
 * @property {number} userId - ID del usuario que paga
 * @property {number} gymId - ID del gimnasio
 * @property {number} amount - Monto del pago
 * @property {string} [payment_method] - Método de pago (efectivo, tarjeta, transferencia, etc.)
 * @property {Date} [payment_date] - Fecha del pago (default: now)
 * @property {Date} [period_start] - Inicio del período pagado
 * @property {Date} [period_end] - Fin del período pagado
 * @property {string} [status='PENDING'] - Estado (PENDING, COMPLETED, FAILED, REFUNDED)
 * @property {string} [reference_number] - Número de referencia del pago
 * @property {string} [notes] - Notas adicionales
 */
class CreateGymPaymentCommand {
  constructor({
    userId,
    gymId,
    amount,
    payment_method = null,
    payment_date = null,
    period_start = null,
    period_end = null,
    status = 'PENDING',
    reference_number = null,
    notes = null,
  }) {
    this.userId = userId;
    this.gymId = gymId;
    this.amount = amount;
    this.payment_method = payment_method;
    this.payment_date = payment_date || new Date();
    this.period_start = period_start;
    this.period_end = period_end;
    this.status = status;
    this.reference_number = reference_number;
    this.notes = notes;
  }
}

/**
 * Command para actualizar el estado de un pago
 *
 * @typedef {Object} UpdateGymPaymentStatusCommand
 * @property {number} paymentId - ID del pago
 * @property {string} status - Nuevo estado (PENDING, COMPLETED, FAILED, REFUNDED)
 * @property {string} [notes] - Notas adicionales sobre el cambio de estado
 * @property {number} updatedBy - ID del admin que actualiza
 */
class UpdateGymPaymentStatusCommand {
  constructor({ paymentId, status, notes = null, updatedBy }) {
    this.paymentId = paymentId;
    this.status = status;
    this.notes = notes;
    this.updatedBy = updatedBy;
  }
}

/**
 * Command para actualizar detalles de un pago
 *
 * @typedef {Object} UpdateGymPaymentCommand
 * @property {number} paymentId - ID del pago
 * @property {number} [amount] - Monto
 * @property {string} [payment_method] - Método de pago
 * @property {Date} [period_start] - Inicio del período
 * @property {Date} [period_end] - Fin del período
 * @property {string} [reference_number] - Número de referencia
 * @property {string} [notes] - Notas
 * @property {number} updatedBy - ID del admin que actualiza
 */
class UpdateGymPaymentCommand {
  constructor({
    paymentId,
    amount,
    payment_method,
    period_start,
    period_end,
    reference_number,
    notes,
    updatedBy,
  }) {
    this.paymentId = paymentId;
    this.amount = amount;
    this.payment_method = payment_method;
    this.period_start = period_start;
    this.period_end = period_end;
    this.reference_number = reference_number;
    this.notes = notes;
    this.updatedBy = updatedBy;
  }
}

/**
 * Command para solicitar reembolso de un pago
 *
 * @typedef {Object} RefundGymPaymentCommand
 * @property {number} paymentId - ID del pago
 * @property {string} reason - Razón del reembolso
 * @property {number} requestedBy - ID del usuario/admin que solicita
 * @property {boolean} isAdmin - Si es solicitado por admin
 */
class RefundGymPaymentCommand {
  constructor({ paymentId, reason, requestedBy, isAdmin = false }) {
    this.paymentId = paymentId;
    this.reason = reason;
    this.requestedBy = requestedBy;
    this.isAdmin = isAdmin;
  }
}

/**
 * Command para eliminar un pago (soft delete)
 *
 * Solo admins pueden eliminar
 *
 * @typedef {Object} DeleteGymPaymentCommand
 * @property {number} paymentId - ID del pago
 * @property {string} deleteReason - Razón de eliminación
 * @property {number} deletedBy - ID del admin que elimina
 */
class DeleteGymPaymentCommand {
  constructor({ paymentId, deleteReason, deletedBy }) {
    this.paymentId = paymentId;
    this.deleteReason = deleteReason;
    this.deletedBy = deletedBy;
  }
}

module.exports = {
  CreateGymPaymentCommand,
  UpdateGymPaymentStatusCommand,
  UpdateGymPaymentCommand,
  RefundGymPaymentCommand,
  DeleteGymPaymentCommand,
};
