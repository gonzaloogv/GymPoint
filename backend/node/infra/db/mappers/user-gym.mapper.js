/**
 * UserGym Infra Mapper - Lote 9
 * Transforms Sequelize UserGym models to POJOs
 */

// ============================================================================
// SINGLE ENTITY MAPPERS
// ============================================================================

function toUserGym(model) {
  if (!model) return null;

  const plain = model.get ? model.get({ plain: true }) : model;

  return {
    id_user_gym: plain.id_user_gym,
    id_user_profile: plain.id_user_profile,
    id_gym: plain.id_gym,
    subscription_plan: plain.subscription_plan,
    subscription_start: plain.subscription_start,
    subscription_end: plain.subscription_end,
    is_active: plain.is_active,
    created_at: plain.created_at,
    updated_at: plain.updated_at,
    // Include gym if loaded
    gym: plain.gym || plain.Gym || null,
    // Include user profile if loaded
    userProfile: plain.userProfile || plain.UserProfile || null,
  };
}

// ============================================================================
// ARRAY MAPPERS
// ============================================================================

function toUserGyms(models) {
  if (!Array.isArray(models)) return [];
  return models.map(toUserGym);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  toUserGym,
  toUserGyms,
};
