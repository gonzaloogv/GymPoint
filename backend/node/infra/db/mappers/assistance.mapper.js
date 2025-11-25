/**
 * Infra Mapper para Assistance
 * Transforma modelos Sequelize a POJOs (Plain Old JavaScript Objects)
 * NUNCA exponer instancias de Sequelize fuera de la capa de infraestructura
 */

/**
 * Transforma modelo Sequelize de Assistance a POJO
 * @param {Object} model - Instancia de Sequelize
 * @returns {Object|null} POJO con datos de asistencia
 */
function toAssistance(model) {
  if (!model) return null;

  // Obtener objeto plano (sin métodos de Sequelize)
  const plain = model.get ? model.get({ plain: true }) : model;

  return {
    id_assistance: plain.id_assistance,
    id_user_profile: plain.id_user_profile,
    id_gym: plain.id_gym,
    date: plain.date,
    check_in_time: plain.check_in_time,
    check_out_time: plain.check_out_time,
    duration_minutes: plain.duration_minutes,
    auto_checkin: plain.auto_checkin,
    distance_meters: plain.distance_meters,
    verified: plain.verified,
    created_at: plain.created_at,
    // Incluir relaciones si están cargadas
    ...(plain.gym && {
      gym: {
        id_gym: plain.gym.id_gym,
        name: plain.gym.name,
        city: plain.gym.city,
        address: plain.gym.address,
        latitude: plain.gym.latitude,
        longitude: plain.gym.longitude
      }
    }),
    ...(plain.userProfile && {
      userProfile: {
        id_user_profile: plain.userProfile.id_user_profile,
        full_name: plain.userProfile.full_name,
        username: plain.userProfile.username
      }
    })
  };
}

/**
 * Transforma array de modelos Sequelize a array de POJOs
 * @param {Array} models - Array de instancias de Sequelize
 * @returns {Array} Array de POJOs
 */
function toAssistances(models) {
  if (!Array.isArray(models)) return [];
  return models.map(toAssistance);
}

/**
 * Transforma resultado paginado de Sequelize
 * @param {Object} result - Resultado de findAndCountAll
 * @returns {Object} Resultado paginado con POJOs
 */
function toPaginatedAssistances(result) {
  return {
    items: toAssistances(result.rows || []),
    total: result.count || 0
  };
}

module.exports = {
  toAssistance,
  toAssistances,
  toPaginatedAssistances
};
