/**
 * Mappers de infra para GymPayment
 * Transforman modelos Sequelize a POJOs
 */

function toGymPayment(model) {
  if (!model) return null;
  const payment = {
    id_payment: model.id_payment,
    id_user_profile: model.id_user_profile,
    id_gym: model.id_gym,
    amount: parseFloat(model.amount),
    payment_method: model.payment_method,
    payment_date: model.payment_date,
    period_start: model.period_start,
    period_end: model.period_end,
    status: model.status,
    reference_number: model.reference_number,
    notes: model.notes,
    created_at: model.created_at,
    updated_at: model.updated_at,
  };

  // Incluir asociaciones si están presentes
  if (model.gym) {
    payment.gym = {
      id_gym: model.gym.id_gym,
      name: model.gym.name,
      city: model.gym.city,
    };
  }

  if (model.userProfile) {
    payment.userProfile = {
      id_user_profile: model.userProfile.id_user_profile,
      name: model.userProfile.name,
    };
  }

  return payment;
}

function toGymPayments(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toGymPayment).filter(Boolean);
}

module.exports = {
  toGymPayment,
  toGymPayments,
};
