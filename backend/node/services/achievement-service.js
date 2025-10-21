const { Op } = require('sequelize');
const sequelize = require('../config/database');
const {
  AchievementDefinition,
  UserAchievement,
  UserAchievementEvent,
  UserProfile,
  Streak,
  Assistance,
  FrequencyHistory,
  UserRoutine,
  WorkoutSession,
  UserDailyChallenge,
  TokenLedger,
  Progress,
  ProgressExercise
} = require('../models');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

const CATEGORY_VALUES = Object.values(AchievementDefinition.CATEGORIES);
const METRIC_VALUES = Object.values(AchievementDefinition.METRIC_TYPES);

const METRIC_CALCULATORS = {
  STREAK_DAYS: async (idUserProfile) => {
    const streak = await Streak.findOne({
      where: { id_user: idUserProfile }
    });

    return {
      value: streak?.value || 0,
      sourceType: streak ? 'streak' : null,
      sourceId: streak?.id_streak || null
    };
  },
  STREAK_RECOVERY_USED: async (idUserProfile) => {
    const streak = await Streak.findOne({
      where: { id_user: idUserProfile }
    });

    // recovery_items representa items disponibles; si existe metadata con key used, usarla
    const recoveryUsed = streak ? (streak.recovery_items_used || 0) : 0;
    return {
      value: recoveryUsed,
      sourceType: streak ? 'streak' : null,
      sourceId: streak?.id_streak || null
    };
  },
  ASSISTANCE_TOTAL: async (idUserProfile) => {
    const total = await Assistance.count({
      where: { id_user: idUserProfile }
    });
    return {
      value: total,
      sourceType: 'assistance'
    };
  },
  FREQUENCY_WEEKS_MET: async (idUserProfile) => {
    const total = await FrequencyHistory.count({
      where: {
        id_user_profile: idUserProfile,
        goal_met: true
      }
    });
    return {
      value: total,
      sourceType: 'frequency_history'
    };
  },
  ROUTINE_COMPLETED_COUNT: async (idUserProfile) => {
    const total = await UserRoutine.count({
      where: {
        id_user: idUserProfile,
        finish_date: { [Op.ne]: null }
      }
    });

    return {
      value: total,
      sourceType: 'user_routine'
    };
  },
  WORKOUT_SESSION_COMPLETED: async (idUserProfile) => {
    const total = await WorkoutSession.count({
      where: {
        id_user_profile: idUserProfile,
        status: 'COMPLETED'
      }
    });

    return {
      value: total,
      sourceType: 'workout_session'
    };
  },
  DAILY_CHALLENGE_COMPLETED_COUNT: async (idUserProfile) => {
    const total = await UserDailyChallenge.count({
      where: {
        id_user_profile: idUserProfile,
        completed: true
      }
    });

    return {
      value: total,
      sourceType: 'user_daily_challenge'
    };
  },
  PR_RECORD_COUNT: async (idUserProfile) => {
    const progressIds = await Progress.findAll({
      attributes: ['id_progress'],
      where: { id_user: idUserProfile }
    });

    if (!progressIds.length) {
      return { value: 0, sourceType: 'progress' };
    }

    const total = await ProgressExercise.count({
      where: {
        id_progress: {
          [Op.in]: progressIds.map((p) => p.id_progress)
        }
      }
    });

    return {
      value: total,
      sourceType: 'progress_exercise'
    };
  },
  BODY_WEIGHT_PROGRESS: async (idUserProfile, definition) => {
    const progressEntries = await Progress.findAll({
      attributes: ['body_weight', 'date'],
      where: {
        id_user: idUserProfile,
        body_weight: { [Op.ne]: null }
      },
      order: [['date', 'ASC']],
      limit: 2
    });

    if (progressEntries.length < 2) {
      return { value: 0, sourceType: 'progress' };
    }

    const start = progressEntries[0].body_weight;
    const latest = progressEntries[progressEntries.length - 1].body_weight;
    const direction = definition.metadata?.direction || 'INCREASE';
    const delta = direction === 'DECREASE' ? start - latest : latest - start;

    return {
      value: Math.max(0, delta),
      sourceType: 'progress',
      metadata: { start, latest }
    };
  },
  TOKEN_BALANCE_REACHED: async (idUserProfile) => {
    const userProfile = await UserProfile.findByPk(idUserProfile, {
      attributes: ['tokens']
    });

    return {
      value: userProfile?.tokens || 0,
      sourceType: 'user_profile'
    };
  },
  TOKEN_SPENT_TOTAL: async (idUserProfile) => {
    const spent = await TokenLedger.sum('delta', {
      where: {
        id_user_profile: idUserProfile,
        delta: { [Op.lt]: 0 }
      }
    });

    return {
      value: Math.abs(spent || 0),
      sourceType: 'token_ledger'
    };
  },
  ONBOARDING_STEP_COMPLETED: async (idUserProfile, definition) => {
    const userProfile = await UserProfile.findByPk(idUserProfile);
    if (!userProfile) {
      return { value: 0, sourceType: 'user_profile' };
    }

    const field = definition.metadata?.field || 'onboarding_completed';
    const value = Boolean(userProfile[field]) ? 1 : 0;

    return {
      value,
      sourceType: 'user_profile',
      metadata: { field }
    };
  }
};

const getDefinitions = async ({ category, categories, includeInactive = false } = {}) => {
  const where = {};
  if (!includeInactive) {
    where.is_active = true;
  }
  if (Array.isArray(categories) && categories.length) {
    where.category = { [Op.in]: categories };
  } else if (category) {
    where.category = category;
  }

  return AchievementDefinition.findAll({
    where,
    order: [['category', 'ASC'], ['target_value', 'ASC']]
  });
};

const ensureUserAchievement = async ({ idUserProfile, definition, transaction }) => {
  const [achievement] = await UserAchievement.findOrCreate({
    where: {
      id_user_profile: idUserProfile,
      id_achievement_definition: definition.id_achievement_definition
    },
    defaults: {
      progress_value: 0,
      progress_denominator: definition.target_value
    },
    transaction
  });

  return achievement;
};

const recordEvent = async ({
  transaction,
  userAchievement,
  eventType,
  delta,
  snapshotValue,
  sourceType,
  sourceId,
  metadata
}) => {
  await UserAchievementEvent.create(
    {
      id_user_achievement: userAchievement.id_user_achievement,
      event_type: eventType,
      delta,
      snapshot_value: snapshotValue,
      source_type: sourceType,
      source_id: sourceId,
      metadata: metadata || null
    },
    { transaction }
  );
};

const calculateMetric = async (idUserProfile, definition, options = {}) => {
  const calculator = METRIC_CALCULATORS[definition.metric_type];
  if (!calculator) {
    return {
      value: 0,
      metadata: { reason: 'UNSUPPORTED_METRIC' }
    };
  }

  return calculator(idUserProfile, definition, options);
};

const syncAchievementForUser = async ({
  idUserProfile,
  definition,
  sourceType,
  sourceId,
  transaction
}) => {
  const t = transaction || (await sequelize.transaction());

  try {
    const userAchievement = await ensureUserAchievement({
      idUserProfile,
      definition,
      transaction: t
    });

    const { value, denominator, metadata, sourceType: computedSourceType, sourceId: computedSourceId } =
      await calculateMetric(idUserProfile, definition, { transaction: t });

    const effectiveDenominator = denominator || definition.target_value;
    const previousValue = userAchievement.progress_value || 0;
    const progressDelta = value - previousValue;
    const prevUnlocked = userAchievement.unlocked;
    const unlocked = effectiveDenominator > 0 ? value >= effectiveDenominator : value > 0;

    let shouldPersist = false;

    if (progressDelta !== 0) {
      userAchievement.progress_value = value;
      shouldPersist = true;
      await recordEvent({
        transaction: t,
        userAchievement,
        eventType: 'PROGRESS',
        delta: progressDelta,
        snapshotValue: value,
        sourceType: computedSourceType || sourceType || null,
        sourceId: computedSourceId || sourceId || null,
        metadata
      });
    }

    if (
      effectiveDenominator &&
      effectiveDenominator !== userAchievement.progress_denominator
    ) {
      userAchievement.progress_denominator = effectiveDenominator;
      shouldPersist = true;
    }

    if (metadata && JSON.stringify(metadata) !== JSON.stringify(userAchievement.metadata || null)) {
      userAchievement.metadata = metadata;
      shouldPersist = true;
    }

    if (
      (computedSourceType || sourceType) &&
      userAchievement.last_source_type !== (computedSourceType || sourceType)
    ) {
      userAchievement.last_source_type = computedSourceType || sourceType;
      shouldPersist = true;
    }

    if (
      (computedSourceId || sourceId) &&
      userAchievement.last_source_id !== (computedSourceId || sourceId)
    ) {
      userAchievement.last_source_id = computedSourceId || sourceId;
      shouldPersist = true;
    }

    if (unlocked && !prevUnlocked) {
      userAchievement.unlocked = true;
      userAchievement.unlocked_at = new Date();
      shouldPersist = true;

      await recordEvent({
        transaction: t,
        userAchievement,
        eventType: 'UNLOCKED',
        delta: progressDelta > 0 ? progressDelta : value,
        snapshotValue: value,
        sourceType: computedSourceType || sourceType || null,
        sourceId: computedSourceId || sourceId || null,
        metadata
      });
    } else if (!unlocked && prevUnlocked) {
      userAchievement.unlocked = false;
      userAchievement.unlocked_at = null;
      shouldPersist = true;

      await recordEvent({
        transaction: t,
        userAchievement,
        eventType: 'RESET',
        delta: progressDelta,
        snapshotValue: value,
        sourceType: computedSourceType || sourceType || null,
        sourceId: computedSourceId || sourceId || null,
        metadata
      });
    }

    if (shouldPersist) {
      await userAchievement.save({ transaction: t });
    }

    if (!transaction) {
      await t.commit();
    }

    const justUnlocked = unlocked && !prevUnlocked;

    return {
      definition,
      userAchievement,
      unlocked,
      progressDelta,
      justUnlocked
    };
  } catch (error) {
    if (!transaction) {
      await t.rollback();
    }
    throw error;
  }
};

const syncAllAchievementsForUser = async (idUserProfile, options = {}) => {
  const definitions = await getDefinitions({
    category: options.category,
    categories: options.categories,
    includeInactive: options.includeInactive
  });

  const results = [];
  for (const definition of definitions) {
    const result = await syncAchievementForUser({
      idUserProfile,
      definition,
      transaction: options.transaction
    });
    results.push(result);
  }

  return results;
};

const getUserAchievements = async (idUserProfile, { category, categories } = {}) => {
  const definitions = await getDefinitions({ category, categories });
  if (!definitions.length) return [];

  const ids = definitions.map((definition) => definition.id_achievement_definition);

  const achievementMap = new Map();
  const existing = await UserAchievement.findAll({
    where: {
      id_user_profile: idUserProfile,
      id_achievement_definition: { [Op.in]: ids }
    }
  });

  for (const achievement of existing) {
    achievementMap.set(achievement.id_achievement_definition, achievement);
  }

  return definitions.map((definition) => {
    const achievement = achievementMap.get(definition.id_achievement_definition);
    const progressValue = achievement?.progress_value || 0;
    const denominator = achievement?.progress_denominator || definition.target_value || 1;
    const percentage = denominator > 0 ? Math.min(1, progressValue / denominator) : 0;

    return {
      definition: definition.get({ plain: true }),
      progress: {
        value: progressValue,
        denominator,
        percentage
      },
      unlocked: Boolean(achievement?.unlocked),
      unlocked_at: achievement?.unlocked_at || null,
      last_source_type: achievement?.last_source_type || null,
      last_source_id: achievement?.last_source_id || null
    };
  });
};

const sanitizeDefinitionPayload = (payload, { isUpdate = false } = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('Datos de logro inválidos');
  }

  const {
    code,
    name,
    description = null,
    category,
    metric_type,
    target_value,
    metadata = null,
    icon_url = null,
    is_active = true
  } = payload;

  const sanitized = {};

  if (!isUpdate || code !== undefined) {
    const trimmedCode = String(code || '').trim();
    if (!trimmedCode) {
      throw new ValidationError('El campo code es requerido');
    }
    if (trimmedCode.length > 50) {
      throw new ValidationError('El campo code debe tener hasta 50 caracteres');
    }
    sanitized.code = trimmedCode.toUpperCase();
  }

  if (!isUpdate || name !== undefined) {
    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      throw new ValidationError('El campo name es requerido');
    }
    if (trimmedName.length > 120) {
      throw new ValidationError('El campo name debe tener hasta 120 caracteres');
    }
    sanitized.name = trimmedName;
  }

  if (!isUpdate || description !== undefined) {
    sanitized.description = description ? String(description).trim() : null;
  }

  if (!isUpdate || category !== undefined) {
    const normalizedCategory = String(category || '').toUpperCase();
    if (!CATEGORY_VALUES.includes(normalizedCategory)) {
      throw new ValidationError(`Categoría inválida: ${category}`);
    }
    sanitized.category = normalizedCategory;
  }

  if (!isUpdate || metric_type !== undefined) {
    const normalizedMetric = String(metric_type || '').toUpperCase();
    if (!METRIC_VALUES.includes(normalizedMetric)) {
      throw new ValidationError(`Tipo de métrica inválido: ${metric_type}`);
    }
    sanitized.metric_type = normalizedMetric;
  }

  if (!isUpdate || target_value !== undefined) {
    const numericTarget = Number(target_value);
    if (!Number.isInteger(numericTarget) || numericTarget <= 0) {
      throw new ValidationError('El campo target_value debe ser un entero positivo');
    }
    sanitized.target_value = numericTarget;
  }

  if (!isUpdate || metadata !== undefined) {
    if (metadata === null || metadata === undefined || metadata === '') {
      sanitized.metadata = null;
    } else if (typeof metadata === 'object' && !Array.isArray(metadata)) {
      sanitized.metadata = metadata;
    } else {
      throw new ValidationError('El metadata debe ser un objeto JSON');
    }
  }

  if (!isUpdate || icon_url !== undefined) {
    if (icon_url === null || icon_url === undefined || icon_url === '') {
      sanitized.icon_url = null;
    } else {
      const trimmedIcon = String(icon_url).trim();
      if (trimmedIcon.length > 500) {
        throw new ValidationError('El campo icon_url debe tener hasta 500 caracteres');
      }
      sanitized.icon_url = trimmedIcon;
    }
  }

  if (!isUpdate || is_active !== undefined) {
    sanitized.is_active = Boolean(is_active);
  }

  return sanitized;
};

const createDefinition = async (payload) => {
  const sanitized = sanitizeDefinitionPayload(payload);

  const existing = await AchievementDefinition.findOne({
    where: { code: sanitized.code }
  });
  if (existing) {
    throw new ConflictError(`Ya existe un logro con el código ${sanitized.code}`);
  }

  const definition = await AchievementDefinition.create(sanitized);
  return definition;
};

const updateDefinition = async (id, payload) => {
  const definition = await AchievementDefinition.findByPk(id);
  if (!definition) {
    throw new NotFoundError('Logro');
  }

  const sanitized = sanitizeDefinitionPayload(payload, { isUpdate: true });

  if (sanitized.code && sanitized.code !== definition.code) {
    const duplicate = await AchievementDefinition.findOne({
      where: {
        code: sanitized.code,
        id_achievement_definition: { [Op.ne]: id }
      }
    });
    if (duplicate) {
      throw new ConflictError(`Ya existe un logro con el código ${sanitized.code}`);
    }
  }

  const targetValueChanged =
    sanitized.target_value !== undefined && sanitized.target_value !== definition.target_value;

  Object.assign(definition, sanitized);
  await definition.save();

  if (targetValueChanged) {
    await UserAchievement.update(
      { progress_denominator: sanitized.target_value },
      { where: { id_achievement_definition: id } }
    );
  }

  return definition;
};

const deleteDefinition = async (id) => {
  const definition = await AchievementDefinition.findByPk(id);
  if (!definition) {
    throw new NotFoundError('Logro');
  }

  await definition.destroy();
  return { success: true };
};

module.exports = {
  getDefinitions,
  syncAchievementForUser,
  syncAllAchievementsForUser,
  getUserAchievements,
  createDefinition,
  updateDefinition,
  deleteDefinition
};
