/**
 * Payment Commands - Lote 9
 * Comandos para operaciones de escritura en pagos de MercadoPago
 */

// ============================================================================
// MERCADOPAGO PAYMENT COMMANDS
// ============================================================================

/**
 * CreatePaymentPreferenceCommand
 * Crea una preferencia de pago en MercadoPago
 */
class CreatePaymentPreferenceCommand {
  constructor({
    userProfileId,
    gymId,
    subscriptionType = 'MONTHLY',
    autoRenew = false,
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
    this.subscriptionType = subscriptionType;
    this.autoRenew = autoRenew;
  }
}

/**
 * CreatePaymentCommand
 * Crea un registro de pago en la base de datos
 */
class CreatePaymentCommand {
  constructor({
    userProfileId,
    gymId = null,
    paymentId = null,
    preferenceId = null,
    status = 'PENDING',
    statusDetail = null,
    amount,
    currency = 'ARS',
    description = null,
    subscriptionType = null,
    paymentMethodId = null,
    paymentTypeId = null,
    payerEmail = null,
    externalReference = null,
    metadata = null,
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
    this.paymentId = paymentId;
    this.preferenceId = preferenceId;
    this.status = status;
    this.statusDetail = statusDetail;
    this.amount = amount;
    this.currency = currency;
    this.description = description;
    this.subscriptionType = subscriptionType;
    this.paymentMethodId = paymentMethodId;
    this.paymentTypeId = paymentTypeId;
    this.payerEmail = payerEmail;
    this.externalReference = externalReference;
    this.metadata = metadata;
  }
}

/**
 * UpdatePaymentStatusCommand
 * Actualiza el estado de un pago (webhook)
 */
class UpdatePaymentStatusCommand {
  constructor({
    paymentId,
    status,
    statusDetail = null,
    paymentMethodId = null,
    paymentTypeId = null,
    metadata = null,
  }) {
    this.paymentId = paymentId;
    this.status = status;
    this.statusDetail = statusDetail;
    this.paymentMethodId = paymentMethodId;
    this.paymentTypeId = paymentTypeId;
    this.metadata = metadata;
  }
}

module.exports = {
  CreatePaymentPreferenceCommand,
  CreatePaymentCommand,
  UpdatePaymentStatusCommand,
};
