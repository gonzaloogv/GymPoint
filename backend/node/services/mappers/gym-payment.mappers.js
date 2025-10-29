/**
 * Mappers para el dominio Gym Payments (Pagos de Suscripciones)
 *
 * Transforman entre DTOs (API) ↔ Commands/Queries ↔ Entidades (dominio)
 */

const {
  CreateGymPaymentCommand,
  UpdateGymPaymentStatusCommand,
  UpdateGymPaymentCommand,
  RefundGymPaymentCommand,
  DeleteGymPaymentCommand,
} = require('../commands/gym-payment.commands');

const {
  ListUserGymPaymentsQuery,
  ListGymPaymentsQuery,
  GetGymPaymentByIdQuery,
  GetGymPaymentStatsQuery,
  GetGymTotalRevenueQuery,
  HasUserPendingPaymentsQuery,
} = require('../queries/gym-payment.queries');

const { normalizePagination } = require('../../utils/pagination');
const { normalizeSortParams } = require('../../utils/sort-whitelist');

const PAYMENT_SORTABLE_FIELDS = new Set(['payment_date', 'amount', 'created_at', 'status']);

// ============================================================================
// RequestDTO → Command
// ============================================================================

function toCreateGymPaymentCommand(dto, userId, gymId) {
  return new CreateGymPaymentCommand({
    userId,
    gymId,
    amount: dto.amount,
    payment_method: dto.payment_method || null,
    payment_date: dto.payment_date ? new Date(dto.payment_date) : null,
    period_start: dto.period_start ? new Date(dto.period_start) : null,
    period_end: dto.period_end ? new Date(dto.period_end) : null,
    status: dto.status || 'PENDING',
    reference_number: dto.reference_number || null,
    notes: dto.notes || null,
  });
}

function toUpdateGymPaymentStatusCommand(paymentId, status, notes, updatedBy) {
  return new UpdateGymPaymentStatusCommand({
    paymentId,
    status,
    notes,
    updatedBy,
  });
}

function toUpdateGymPaymentCommand(dto, paymentId, updatedBy) {
  return new UpdateGymPaymentCommand({
    paymentId,
    amount: dto.amount,
    payment_method: dto.payment_method,
    period_start: dto.period_start ? new Date(dto.period_start) : undefined,
    period_end: dto.period_end ? new Date(dto.period_end) : undefined,
    reference_number: dto.reference_number,
    notes: dto.notes,
    updatedBy,
  });
}

function toRefundGymPaymentCommand(paymentId, reason, requestedBy, isAdmin = false) {
  return new RefundGymPaymentCommand({
    paymentId,
    reason,
    requestedBy,
    isAdmin,
  });
}

function toDeleteGymPaymentCommand(paymentId, deleteReason, deletedBy) {
  return new DeleteGymPaymentCommand({
    paymentId,
    deleteReason,
    deletedBy,
  });
}

// ============================================================================
// RequestDTO → Query
// ============================================================================

function toListUserGymPaymentsQuery(userId, queryParams) {
  const { page, limit } = normalizePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const { sortBy, order } = normalizeSortParams(
    queryParams.sortBy,
    queryParams.order,
    PAYMENT_SORTABLE_FIELDS,
    'payment_date',
    'DESC'
  );

  return new ListUserGymPaymentsQuery({
    userId,
    page,
    limit,
    sortBy,
    order,
    status: queryParams.status || null,
    gymId: queryParams.gym_id ? Number.parseInt(queryParams.gym_id) : null,
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
  });
}

function toListGymPaymentsQuery(gymId, queryParams) {
  const { page, limit } = normalizePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const { sortBy, order } = normalizeSortParams(
    queryParams.sortBy,
    queryParams.order,
    PAYMENT_SORTABLE_FIELDS,
    'payment_date',
    'DESC'
  );

  return new ListGymPaymentsQuery({
    gymId,
    page,
    limit,
    sortBy,
    order,
    status: queryParams.status || null,
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
    payment_method: queryParams.payment_method || null,
  });
}

function toGetGymPaymentByIdQuery(paymentId, userId = null, gymId = null) {
  return new GetGymPaymentByIdQuery({ paymentId, userId, gymId });
}

function toGetGymPaymentStatsQuery(gymId, queryParams) {
  return new GetGymPaymentStatsQuery({
    gymId,
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
    group_by: queryParams.group_by || 'month',
  });
}

function toGetGymTotalRevenueQuery(gymId, queryParams) {
  return new GetGymTotalRevenueQuery({
    gymId,
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
    status: queryParams.status || 'COMPLETED',
  });
}

function toHasUserPendingPaymentsQuery(userId, gymId) {
  return new HasUserPendingPaymentsQuery({ userId, gymId });
}

// ============================================================================
// Entity → ResponseDTO
// ============================================================================

function toGymPaymentResponse(payment, options = {}) {
  const response = {
    id_payment: payment.id_payment,
    id_user_profile: payment.id_user_profile,
    id_gym: payment.id_gym,
    amount: Number.parseFloat(payment.amount),
    payment_method: payment.payment_method || null,
    payment_date: payment.payment_date.toISOString(),
    period_start: payment.period_start ? payment.period_start : null,
    period_end: payment.period_end ? payment.period_end : null,
    status: payment.status,
    reference_number: payment.reference_number || null,
    notes: payment.notes || null,
    created_at: payment.created_at.toISOString(),
    updated_at: payment.updated_at ? payment.updated_at.toISOString() : null,
  };

  // Agregar info del gym si está disponible
  if (payment.gym && options.includeGym !== false) {
    response.gym = {
      id_gym: payment.gym.id_gym,
      name: payment.gym.name,
      city: payment.gym.city,
    };
  }

  // Agregar info del usuario si está disponible
  if (payment.userProfile && options.includeUser !== false) {
    response.user = {
      id_user_profile: payment.userProfile.id_user_profile,
      name: payment.userProfile.name,
    };
  }

  return response;
}

function toPaginatedGymPaymentsResponse({ items, total, page, limit }, options = {}) {
  return {
    items: items.map(payment => toGymPaymentResponse(payment, options)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

function toGymPaymentStatsResponse(stats) {
  return {
    id_gym: stats.id_gym,
    total_payments: stats.total_payments || 0,
    total_revenue: Number.parseFloat(stats.total_revenue) || 0,
    completed_payments: stats.completed_payments || 0,
    pending_payments: stats.pending_payments || 0,
    failed_payments: stats.failed_payments || 0,
    refunded_payments: stats.refunded_payments || 0,
    period: stats.period || null,
  };
}

module.exports = {
  // RequestDTO → Command
  toCreateGymPaymentCommand,
  toUpdateGymPaymentStatusCommand,
  toUpdateGymPaymentCommand,
  toRefundGymPaymentCommand,
  toDeleteGymPaymentCommand,

  // RequestDTO → Query
  toListUserGymPaymentsQuery,
  toListGymPaymentsQuery,
  toGetGymPaymentByIdQuery,
  toGetGymPaymentStatsQuery,
  toGetGymTotalRevenueQuery,
  toHasUserPendingPaymentsQuery,

  // Entity → ResponseDTO
  toGymPaymentResponse,
  toPaginatedGymPaymentsResponse,
  toGymPaymentStatsResponse,
};
