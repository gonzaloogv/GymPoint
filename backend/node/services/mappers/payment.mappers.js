/**
 * Payment Mappers - Lote 9
 * Transformaciones entre DTOs, Commands/Queries y Entities para pagos
 */

const {
  CreatePaymentPreferenceCommand,
  CreatePaymentCommand,
  UpdatePaymentStatusCommand,
} = require('../commands/payment.commands');

const {
  GetPaymentByIdQuery,
  GetPaymentByMPIdQuery,
  ListPaymentsForUserQuery,
  ListPaymentsForGymQuery,
  GetPaymentStatsQuery,
} = require('../queries/payment.queries');

// ============================================================================
// DTO → Command
// ============================================================================

function toCreatePaymentPreferenceCommand(dto) {
  return new CreatePaymentPreferenceCommand({
    userProfileId: dto.userProfileId,
    gymId: dto.gymId,
    subscriptionType: dto.subscriptionType || 'MONTHLY',
    autoRenew: dto.autoRenew || false,
  });
}

function toCreatePaymentCommand(dto) {
  return new CreatePaymentCommand({
    userProfileId: dto.userProfileId,
    gymId: dto.gymId || null,
    paymentId: dto.paymentId || null,
    preferenceId: dto.preferenceId || null,
    status: dto.status || 'PENDING',
    statusDetail: dto.statusDetail || null,
    amount: dto.amount,
    currency: dto.currency || 'ARS',
    description: dto.description || null,
    subscriptionType: dto.subscriptionType || null,
    paymentMethodId: dto.paymentMethodId || null,
    paymentTypeId: dto.paymentTypeId || null,
    payerEmail: dto.payerEmail || null,
    externalReference: dto.externalReference || null,
    metadata: dto.metadata || null,
  });
}

function toUpdatePaymentStatusCommand(dto) {
  return new UpdatePaymentStatusCommand({
    paymentId: dto.paymentId,
    status: dto.status,
    statusDetail: dto.statusDetail || null,
    paymentMethodId: dto.paymentMethodId || null,
    paymentTypeId: dto.paymentTypeId || null,
    metadata: dto.metadata || null,
  });
}

// ============================================================================
// DTO → Query
// ============================================================================

function toGetPaymentByIdQuery(dto) {
  return new GetPaymentByIdQuery({
    paymentId: dto.paymentId,
  });
}

function toGetPaymentByMPIdQuery(dto) {
  return new GetPaymentByMPIdQuery({
    mpPaymentId: dto.mpPaymentId,
  });
}

function toListPaymentsForUserQuery(dto) {
  return new ListPaymentsForUserQuery({
    userProfileId: dto.userProfileId,
    page: dto.page || 1,
    limit: dto.limit || 20,
    status: dto.status || null,
    gymId: dto.gymId || null,
  });
}

function toListPaymentsForGymQuery(dto) {
  return new ListPaymentsForGymQuery({
    gymId: dto.gymId,
    page: dto.page || 1,
    limit: dto.limit || 20,
    status: dto.status || null,
    fromDate: dto.fromDate || null,
    toDate: dto.toDate || null,
  });
}

function toGetPaymentStatsQuery(dto) {
  return new GetPaymentStatsQuery({
    gymId: dto.gymId || null,
    fromDate: dto.fromDate || null,
    toDate: dto.toDate || null,
  });
}

// ============================================================================
// Entity → DTO
// ============================================================================

function toPaymentDTO(payment) {
  if (!payment) return null;

  return {
    id: payment.id_mp_payment,
    userProfileId: payment.id_user_profile,
    gymId: payment.id_gym,
    paymentId: payment.payment_id,
    preferenceId: payment.preference_id,
    status: payment.status,
    statusDetail: payment.status_detail,
    amount: parseFloat(payment.amount),
    currency: payment.currency,
    description: payment.description,
    subscriptionType: payment.subscription_type,
    paymentMethodId: payment.payment_method_id,
    paymentTypeId: payment.payment_type_id,
    payerEmail: payment.payer_email,
    externalReference: payment.external_reference,
    metadata: payment.metadata,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at,
  };
}

function toPaymentsDTO(payments) {
  return payments.map(toPaymentDTO);
}

function toPaginatedPaymentsDTO(result) {
  return {
    items: toPaymentsDTO(result.items || result.rows || []),
    total: result.total || result.count || 0,
    page: result.page || 1,
    limit: result.limit || 20,
    totalPages: result.totalPages || Math.ceil((result.total || result.count || 0) / (result.limit || 20)),
  };
}

function toPaymentStatsDTO(stats) {
  return {
    totalPayments: stats.totalPayments || 0,
    totalAmount: parseFloat(stats.totalAmount || 0),
    approvedPayments: stats.approvedPayments || 0,
    approvedAmount: parseFloat(stats.approvedAmount || 0),
    pendingPayments: stats.pendingPayments || 0,
    rejectedPayments: stats.rejectedPayments || 0,
    averageAmount: parseFloat(stats.averageAmount || 0),
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // DTO → Command
  toCreatePaymentPreferenceCommand,
  toCreatePaymentCommand,
  toUpdatePaymentStatusCommand,

  // DTO → Query
  toGetPaymentByIdQuery,
  toGetPaymentByMPIdQuery,
  toListPaymentsForUserQuery,
  toListPaymentsForGymQuery,
  toGetPaymentStatsQuery,

  // Entity → DTO
  toPaymentDTO,
  toPaymentsDTO,
  toPaginatedPaymentsDTO,
  toPaymentStatsDTO,
};
