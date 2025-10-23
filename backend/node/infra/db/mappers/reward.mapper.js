/**
 * Mappers de infra para Reward, RewardCode, ClaimedReward, TokenLedger, RewardGymStatsDaily
 * Transforman modelos Sequelize a POJOs
 */

/**
 * Convierte modelo Reward de Sequelize a POJO
 */
function toReward(model) {
  if (!model) return null;
  const pojo = {
    id_reward: model.id_reward,
    id_gym: model.id_gym,
    name: model.name,
    description: model.description,
    token_cost: model.token_cost,
    discount_percentage: model.discount_percentage,
    discount_amount: model.discount_amount,
    stock: model.stock,
    valid_from: model.valid_from,
    valid_until: model.valid_until,
    is_active: model.is_active,
    image_url: model.image_url,
    terms: model.terms,
    created_at: model.created_at,
    updated_at: model.updated_at,
    deleted_at: model.deleted_at || null,
  };

  // Incluir relación Gym si está presente
  if (model.Gym) {
    pojo.Gym = toGym(model.Gym);
  }

  return pojo;
}

/**
 * Convierte array de Reward a POJOs
 */
function toRewards(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toReward).filter(Boolean);
}

/**
 * Convierte modelo RewardCode de Sequelize a POJO
 */
function toRewardCode(model) {
  if (!model) return null;
  const pojo = {
    id_code: model.id_code,
    id_reward: model.id_reward,
    code: model.code,
    is_used: model.is_used,
    created_at: model.created_at,
  };

  // Incluir relación Reward si está presente
  if (model.Reward) {
    pojo.Reward = toReward(model.Reward);
  }

  return pojo;
}

/**
 * Convierte array de RewardCode a POJOs
 */
function toRewardCodes(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toRewardCode).filter(Boolean);
}

/**
 * Convierte modelo ClaimedReward de Sequelize a POJO
 */
function toClaimedReward(model) {
  if (!model) return null;
  const pojo = {
    id_claimed_reward: model.id_claimed_reward,
    id_user_profile: model.id_user_profile,
    id_reward: model.id_reward,
    id_code: model.id_code,
    claimed_date: model.claimed_date,
    status: model.status,
    tokens_spent: model.tokens_spent,
    used_at: model.used_at,
    expires_at: model.expires_at,
  };

  // Incluir relaciones si están presentes
  if (model.Reward) {
    pojo.Reward = toReward(model.Reward);
  }
  if (model.RewardCode) {
    pojo.RewardCode = toRewardCode(model.RewardCode);
  }
  if (model.UserProfile) {
    pojo.UserProfile = toUserProfile(model.UserProfile);
  }

  return pojo;
}

/**
 * Convierte array de ClaimedReward a POJOs
 */
function toClaimedRewards(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toClaimedReward).filter(Boolean);
}

/**
 * Convierte modelo TokenLedger de Sequelize a POJO
 */
function toTokenLedger(model) {
  if (!model) return null;
  return {
    id_ledger: model.id_ledger,
    id_user_profile: model.id_user_profile,
    delta: model.delta,
    balance_after: model.balance_after,
    reason: model.reason,
    ref_type: model.ref_type,
    ref_id: model.ref_id,
    metadata: model.metadata,
    created_at: model.created_at,
  };
}

/**
 * Convierte array de TokenLedger a POJOs
 */
function toTokenLedgers(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toTokenLedger).filter(Boolean);
}

/**
 * Convierte modelo RewardGymStatsDaily de Sequelize a POJO
 */
function toRewardGymStatsDaily(model) {
  if (!model) return null;
  return {
    id_stat: model.id_stat,
    id_gym: model.id_gym,
    day: model.day,
    total_rewards_claimed: model.total_rewards_claimed,
    total_tokens_spent: model.total_tokens_spent,
    unique_users: model.unique_users,
    created_at: model.created_at,
  };
}

/**
 * Convierte array de RewardGymStatsDaily a POJOs
 */
function toRewardGymStatsDailies(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toRewardGymStatsDaily).filter(Boolean);
}

/**
 * Helper: Convierte Gym a POJO simplificado
 */
function toGym(model) {
  if (!model) return null;
  return {
    id_gym: model.id_gym,
    name: model.name,
    city: model.city,
  };
}

/**
 * Helper: Convierte UserProfile a POJO simplificado
 */
function toUserProfile(model) {
  if (!model) return null;
  return {
    id_user_profile: model.id_user_profile,
    name: model.name,
    lastname: model.lastname,
    profile_picture_url: model.profile_picture_url,
  };
}

module.exports = {
  toReward,
  toRewards,
  toRewardCode,
  toRewardCodes,
  toClaimedReward,
  toClaimedRewards,
  toTokenLedger,
  toTokenLedgers,
  toRewardGymStatsDaily,
  toRewardGymStatsDailies,
};
