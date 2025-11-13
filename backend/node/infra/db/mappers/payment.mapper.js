/**
 * Payment Infra Mapper - Lote 9
 * Transforms Sequelize Payment models to POJOs
 */

// ============================================================================
// SINGLE ENTITY MAPPERS
// ============================================================================

function toPayment(model) {
  if (!model) return null;

  const plain = model.get ? model.get({ plain: true }) : model;

  return {
    id_mp_payment: plain.id_mp_payment,
    id_user_profile: plain.id_user_profile,
    id_gym: plain.id_gym,
    payment_id: plain.payment_id,
    preference_id: plain.preference_id,
    status: plain.status,
    status_detail: plain.status_detail,
    amount: plain.amount,
    currency: plain.currency,
    description: plain.description,
    subscription_type: plain.subscription_type,
    payment_method_id: plain.payment_method_id,
    payment_type_id: plain.payment_type_id,
    payer_email: plain.payer_email,
    external_reference: plain.external_reference,
    metadata: plain.metadata,
    created_at: plain.created_at,
    updated_at: plain.updated_at,
  };
}

// ============================================================================
// ARRAY MAPPERS
// ============================================================================

function toPayments(models) {
  if (!Array.isArray(models)) return [];
  return models.map(toPayment);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  toPayment,
  toPayments,
};
