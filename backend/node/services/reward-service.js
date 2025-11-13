/**
 * Reward Service - Lote 5
 * Maneja recompensas, códigos y canjes usando Commands/Queries
 */

const sequelize = require('../config/database');
const { rewardRepository } = require('../infra/db/repositories');
const { userProfileRepository } = require('../infra/db/repositories');
const { UserProfile, Streak } = require('../models');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const { appEvents, EVENTS } = require('../websocket/events/event-emitter');

const STACKABLE_TYPES = new Set(['streak_saver', 'token_multiplier']);

function parseNullableNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeRewardAttributes(command, existingReward = null) {
  const base = existingReward || {};
  const rawRewardType = command.reward_type ?? base.reward_type ?? null;
  const rewardType =
    typeof rawRewardType === 'string' ? rawRewardType.toLowerCase() : rawRewardType;

  const isStackable =
    command.is_stackable !== undefined ? command.is_stackable : base.is_stackable ?? false;

  const maxStackValue =
    command.max_stack !== undefined
      ? parseNullableNumber(command.max_stack)
      : base.max_stack ?? 1;

  const durationValue =
    command.duration_days !== undefined
      ? parseNullableNumber(command.duration_days)
      : base.duration_days ?? null;

  const cooldownValue =
    command.cooldown_days !== undefined
      ? parseNullableNumber(command.cooldown_days)
      : base.cooldown_days ?? 0;

  let stockValue;
  let stockProvided = false;
  if (command.stock !== undefined) {
    stockProvided = true;
    stockValue = command.stock === null ? null : parseNullableNumber(command.stock);
  } else {
    stockValue = base.stock ?? null;
  }

  let isUnlimited =
    command.is_unlimited !== undefined ? command.is_unlimited : base.is_unlimited ?? false;

  if (
    !isUnlimited &&
    stockValue === null &&
    base &&
    base.stock === null &&
    command.is_unlimited === undefined
  ) {
    isUnlimited = true;
  }

  if (isUnlimited) {
    stockValue = null;
  }

  const requiresPremium =
    command.requires_premium !== undefined
      ? command.requires_premium
      : base.requires_premium ?? false;

  const effectValue =
    command.effect_value !== undefined
      ? parseNullableNumber(command.effect_value)
      : base.effect_value ?? null;

  return {
    rewardType,
    isStackable: Boolean(isStackable),
    maxStack: maxStackValue ?? 1,
    durationDays: durationValue,
    cooldownDays: cooldownValue ?? 0,
    isUnlimited: Boolean(isUnlimited),
    requiresPremium: Boolean(requiresPremium),
    stock: stockValue,
    stockProvided,
    effectValue,
  };
}

function validateRewardAttributes(attrs, { existingReward } = {}) {
  const result = { ...attrs };
  const stockProvided = Boolean(result.stockProvided);
  delete result.stockProvided;

  result.cooldownDays = Number.isFinite(result.cooldownDays)
    ? Math.trunc(result.cooldownDays)
    : 0;

  if (result.cooldownDays < 0) {
    throw new ValidationError('El cooldown debe ser mayor o igual a 0');
  }

  if (!result.isUnlimited) {
    if (result.stock === null || result.stock === undefined || Number.isNaN(result.stock)) {
      if (existingReward?.is_unlimited && !stockProvided) {
        throw new ValidationError('Debes definir un stock al desactivar el modo ilimitado');
      }
      throw new ValidationError('Debes definir un stock disponible o marcar la recompensa como ilimitada');
    }
    if (result.stock < 0) {
      throw new ValidationError('El stock no puede ser negativo');
    }
    result.stock = Math.trunc(result.stock);
  } else {
    result.stock = null;
  }

  result.maxStack = Math.max(
    1,
    Math.trunc(Number.isFinite(result.maxStack) ? result.maxStack : 1)
  );

  if (result.isStackable && !STACKABLE_TYPES.has(result.rewardType)) {
    throw new ValidationError('Solo los multiplicadores o salvavidas pueden ser acumulables en inventario');
  }

  if (!result.isStackable) {
    result.maxStack = 1;
  }

  if (result.rewardType === 'token_multiplier') {
    if (!result.effectValue || Number(result.effectValue) <= 1) {
      throw new ValidationError('El multiplicador debe ser mayor a 1');
    }
    result.effectValue = Number(result.effectValue);
    result.durationDays = result.durationDays ?? 7;
    if (!result.durationDays || result.durationDays <= 0) {
      throw new ValidationError('La duración del multiplicador debe ser mayor a 0');
    }
    result.durationDays = Math.trunc(result.durationDays);
  } else {
    result.durationDays = null;
  }

  if (result.rewardType === 'streak_saver' || result.rewardType === 'pase_gratis') {
    if (!result.effectValue || Number(result.effectValue) <= 0) {
      throw new ValidationError('El valor del efecto debe ser mayor a 0');
    }
    result.effectValue = Math.trunc(result.effectValue);
  }

  return result;
}

// ============================================================================
// REWARDS
// ============================================================================

/**
 * Lista recompensas con filtros y paginación
 * @param {ListRewardsQuery} query
 * @returns {Promise<Object>} Resultado paginado con recompensas (POJOs)
 */
async function listRewards(query) {
  return rewardRepository.findRewards(query);
}

/**
 * Obtiene una recompensa por ID
 * @param {GetRewardByIdQuery} query
 * @returns {Promise<Object|null>} Recompensa (POJO)
 */
async function getReward(query) {
  const reward = await rewardRepository.findRewardById(query.rewardId);
  if (!reward) {
    throw new NotFoundError('Recompensa no encontrada');
  }
  return reward;
}

/**
 * Crea una nueva recompensa
 * @param {CreateRewardCommand} command
 * @returns {Promise<Object>} Recompensa creada (POJO)
 */
async function createReward(command) {
  const transaction = await sequelize.transaction();
  try {
    if (command.token_cost < 0) {
      throw new ValidationError('El costo en tokens debe ser positivo');
    }

    if (
      command.discount_percentage !== undefined &&
      command.discount_percentage !== null &&
      (command.discount_percentage < 0 || command.discount_percentage > 100)
    ) {
      throw new ValidationError('El porcentaje de descuento debe estar entre 0 y 100');
    }

    if (
      command.discount_amount !== undefined &&
      command.discount_amount !== null &&
      command.discount_amount < 0
    ) {
      throw new ValidationError('El monto de descuento debe ser positivo');
    }

    const normalizedAttrs = normalizeRewardAttributes(command);
    const rewardAttrs = validateRewardAttributes(normalizedAttrs);

    const payload = {
      id_gym: command.gymId,
      name: command.name,
      description: command.description,
      reward_type: rewardAttrs.rewardType,
      effect_value: rewardAttrs.effectValue,
      token_cost: command.token_cost,
      discount_percentage: command.discount_percentage ?? null,
      discount_amount: command.discount_amount ?? null,
      stock: rewardAttrs.isUnlimited ? null : rewardAttrs.stock,
      cooldown_days: rewardAttrs.cooldownDays,
      is_unlimited: rewardAttrs.isUnlimited,
      requires_premium: rewardAttrs.requiresPremium,
      is_stackable: rewardAttrs.isStackable,
      max_stack: rewardAttrs.isStackable ? rewardAttrs.maxStack : 1,
      duration_days: rewardAttrs.durationDays,
      valid_from: command.valid_from,
      valid_until: command.valid_until,
      is_active: command.is_active,
      image_url: command.image_url,
      terms: command.terms,
    };

    const reward = await rewardRepository.createReward(payload, { transaction });
    await transaction.commit();

    // Emitir evento de recompensa creada para actualizaciones en tiempo real
    appEvents.emit(EVENTS.REWARD_CREATED, {
      reward: reward,
      timestamp: new Date().toISOString()
    });

    return reward;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Actualiza una recompensa
 * @param {UpdateRewardCommand} command
 * @returns {Promise<Object>} Recompensa actualizada (POJO)
 */
async function updateReward(command) {
  const transaction = await sequelize.transaction();
  try {
    // Verificar que existe
    const reward = await rewardRepository.findRewardById(command.rewardId, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    if (command.token_cost !== undefined && command.token_cost < 0) {
      throw new ValidationError('El costo en tokens debe ser positivo');
    }

    if (
      command.discount_percentage !== undefined &&
      command.discount_percentage !== null &&
      (command.discount_percentage < 0 || command.discount_percentage > 100)
    ) {
      throw new ValidationError('El porcentaje de descuento debe estar entre 0 y 100');
    }

    if (
      command.discount_amount !== undefined &&
      command.discount_amount !== null &&
      command.discount_amount < 0
    ) {
      throw new ValidationError('El monto de descuento debe ser positivo');
    }

    const normalizedAttrs = normalizeRewardAttributes(command, reward);
    const rewardAttrs = validateRewardAttributes(normalizedAttrs, { existingReward: reward });

    const payload = {};
    if (command.name !== undefined) payload.name = command.name;
    if (command.description !== undefined) payload.description = command.description;
    if (command.reward_type !== undefined) payload.reward_type = rewardAttrs.rewardType;
    if (command.effect_value !== undefined || command.reward_type !== undefined) {
      payload.effect_value = rewardAttrs.effectValue;
    }
    if (command.token_cost !== undefined) payload.token_cost = command.token_cost;
    if (command.discount_percentage !== undefined) payload.discount_percentage = command.discount_percentage;
    if (command.discount_amount !== undefined) payload.discount_amount = command.discount_amount;
    if (command.stock !== undefined || command.is_unlimited !== undefined) {
      payload.stock = rewardAttrs.isUnlimited ? null : rewardAttrs.stock;
    }
    if (command.valid_from !== undefined) payload.valid_from = command.valid_from;
    if (command.valid_until !== undefined) payload.valid_until = command.valid_until;
    if (command.is_active !== undefined) payload.is_active = command.is_active;
    if (command.image_url !== undefined) payload.image_url = command.image_url;
    if (command.terms !== undefined) payload.terms = command.terms;
    if (command.cooldown_days !== undefined) payload.cooldown_days = rewardAttrs.cooldownDays;
    if (command.is_unlimited !== undefined) payload.is_unlimited = rewardAttrs.isUnlimited;
    if (command.requires_premium !== undefined) payload.requires_premium = rewardAttrs.requiresPremium;

    const shouldUpdateStackable =
      command.is_stackable !== undefined ||
      command.max_stack !== undefined ||
      command.reward_type !== undefined;
    if (shouldUpdateStackable) {
      payload.is_stackable = rewardAttrs.isStackable;
      payload.max_stack = rewardAttrs.isStackable ? rewardAttrs.maxStack : 1;
    }

    const shouldUpdateDuration =
      command.duration_days !== undefined ||
      command.reward_type !== undefined;
    if (shouldUpdateDuration) {
      payload.duration_days = rewardAttrs.durationDays;
    }

    const updated = await rewardRepository.updateReward(command.rewardId, payload, { transaction });
    await transaction.commit();

    // Emitir evento de recompensa actualizada para actualizaciones en tiempo real
    appEvents.emit(EVENTS.REWARD_UPDATED, {
      reward: updated,
      timestamp: new Date().toISOString()
    });

    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Elimina una recompensa (soft delete)
 * @param {DeleteRewardCommand} command
 * @returns {Promise<number>} Número de registros eliminados
 */
async function deleteReward(command) {
  const transaction = await sequelize.transaction();
  try {
    const reward = await rewardRepository.findRewardById(command.rewardId, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    const deleted = await rewardRepository.deleteReward(command.rewardId, { transaction });
    await transaction.commit();
    return deleted;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// REWARD CODES
// ============================================================================

/**
 * Lista códigos de una recompensa
 * @param {ListRewardCodesQuery} query
 * @returns {Promise<Array>} Array de códigos (POJOs)
 */
async function listRewardCodes(query) {
  return rewardRepository.findRewardCodes(query.rewardId, { unused_only: query.unused_only });
}

/**
 * Obtiene un código por su string
 * @param {GetRewardCodeByStringQuery} query
 * @returns {Promise<Object|null>} Código (POJO)
 */
async function getRewardCodeByString(query) {
  return rewardRepository.findRewardCodeByString(query.code);
}

/**
 * Crea un código de recompensa
 * @param {CreateRewardCodeCommand} command
 * @returns {Promise<Object>} Código creado (POJO)
 */
async function createRewardCode(command) {
  const transaction = await sequelize.transaction();
  try {
    // Verificar que la recompensa existe
    const reward = await rewardRepository.findRewardById(command.rewardId, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    // Verificar que el código no existe
    const existingCode = await rewardRepository.findRewardCodeByString(command.code, { transaction });
    if (existingCode) {
      throw new ConflictError('El código ya existe');
    }

    const payload = {
      id_reward: command.rewardId,
      code: command.code,
    };

    const code = await rewardRepository.createRewardCode(payload, { transaction });
    await transaction.commit();
    return code;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// CLAIMED REWARDS
// ============================================================================

/**
 * Aplica el efecto de una recompensa al perfil del usuario
 * @param {number} userId - ID del UserProfile
 * @param {string} rewardType - Tipo de recompensa ('pase_gratis', 'descuento', etc.)
 * @param {number} effectValue - Valor del efecto (ej: días de premium)
 * @param {Object} options - Opciones de transacción
 * @returns {Promise<void>}
 */
async function canClaimReward(userId, reward, options = {}) {
  const { transaction, preloaded = {} } = options;
  const { inventoryMap, cooldownMap } = preloaded;

  if (reward.requires_premium) {
    const userProfile = await UserProfile.findByPk(userId, { transaction });
    if (!userProfile || userProfile.app_tier !== 'PREMIUM') {
      return {
        canClaim: false,
        reason: 'Esta recompensa es exclusiva para usuarios Premium',
      };
    }
  }

  if (reward.cooldown_days > 0) {
    let cooldown = cooldownMap ? cooldownMap.get(reward.id_reward) : null;
    if (!cooldown) {
      cooldown = await rewardRepository.findRewardCooldown(userId, reward.id_reward, { transaction });
      if (cooldown && cooldownMap) {
        cooldownMap.set(reward.id_reward, cooldown);
      }
    }
    if (cooldown) {
      const now = new Date();
      const availableAt = new Date(cooldown.can_claim_again_at);
      if (now < availableAt) {
        const hoursLeft = Math.ceil((availableAt.getTime() - now.getTime()) / (1000 * 60 * 60));
        return {
          canClaim: false,
          reason: `Debes esperar ${hoursLeft} horas para reclamar esta recompensa nuevamente`,
          cooldownEndsAt: availableAt,
        };
      }
    }
  }

  if (reward.is_stackable) {
    let inventory = inventoryMap ? inventoryMap.get(reward.id_reward) : null;
    if (!inventory) {
      inventory = await rewardRepository.findRewardInventoryEntry(
        userId,
        reward.id_reward,
        reward.reward_type,
        { transaction }
      );
      if (inventory && inventoryMap) {
        inventoryMap.set(reward.id_reward, inventory);
      }
    }

    if (inventory && inventory.quantity >= (reward.max_stack || 1)) {
      return {
        canClaim: false,
        reason: `Ya tienes el máximo de ${reward.max_stack} unidades de este item`,
      };
    }
  }

  return { canClaim: true };
}

async function updateCooldown(userId, rewardId, cooldownDays, options = {}) {
  const { transaction } = options;
  const now = new Date();
  const canClaimAgainAt = new Date(now);
  canClaimAgainAt.setDate(canClaimAgainAt.getDate() + cooldownDays);

  await rewardRepository.upsertRewardCooldownEntry({
    id_user_profile: userId,
    id_reward: rewardId,
    last_claimed_at: now,
    can_claim_again_at: canClaimAgainAt,
  }, { transaction });
}

async function addToInventory(userId, reward, quantity = 1, options = {}) {
  return rewardRepository.upsertRewardInventory({
    userId,
    rewardId: reward.id_reward,
    itemType: reward.reward_type,
    quantity,
    maxStack: reward.max_stack,
  }, options);
}

async function activateTokenMultiplier(userId, multiplierValue, durationDays, options = {}) {
  const { transaction } = options;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt);
  expiresAt.setDate(expiresAt.getDate() + (durationDays || 7));

  return rewardRepository.createActiveUserEffect({
    id_user_profile: userId,
    effect_type: 'token_multiplier',
    multiplier_value: multiplierValue,
    started_at: startedAt,
    expires_at: expiresAt,
    is_consumed: false,
  }, { transaction });
}

async function incrementStreakRecoveryItems(userId, amount, options = {}) {
  const { transaction } = options;
  const streak = await Streak.findOne({
    where: { id_user_profile: userId },
    transaction,
  });

  if (streak) {
    await streak.update(
      {
        recovery_items: (streak.recovery_items || 0) + amount,
      },
      { transaction }
    );
  }
}

async function getActiveMultiplier(userId, options = {}) {
  const { transaction } = options;
  const effects = await rewardRepository.findActiveEffectsByUser(userId, {
    transaction,
    includeExpired: false,
  });

  if (!effects.length) {
    return 1;
  }

  return effects.reduce((total, effect) => total + parseFloat(effect.multiplier_value), 0);
}

async function getUserRewardInventory(userId) {
  const inventory = await rewardRepository.findUserRewardInventory(userId);
  return inventory.map((entry) => ({
    id_inventory: entry.id_inventory,
    id_reward: entry.id_reward,
    item_type: entry.item_type,
    quantity: entry.quantity,
    max_stack: entry.max_stack,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
    reward: entry.reward
      ? {
          id_reward: entry.reward.id_reward,
          name: entry.reward.name,
          description: entry.reward.description,
          reward_type: entry.reward.reward_type,
          image_url: entry.reward.image_url,
        }
      : null,
  }));
}

async function getActiveEffectsForUser(userId) {
  const effects = await rewardRepository.findActiveEffectsByUser(userId, {
    includeExpired: false,
  });
  const now = Date.now();

  const mapped = effects.map((effect) => {
    const expiresAt = new Date(effect.expires_at).getTime();
    return {
      id_effect: effect.id_effect,
      effect_type: effect.effect_type,
      multiplier_value: parseFloat(effect.multiplier_value),
      started_at: effect.started_at,
      expires_at: effect.expires_at,
      hours_remaining: Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60))),
    };
  });

  const totalMultiplier = mapped.reduce((sum, effect) => sum + effect.multiplier_value, 0);

  return {
    effects: mapped,
    total_multiplier: totalMultiplier || 1,
  };
}

/**
 * Activa un multiplicador de tokens desde el inventario del usuario
 * @param {number} userId - ID del usuario
 * @param {number} inventoryId - ID del item en el inventario
 * @returns {Promise<Object>} Efecto activado
 */
async function useInventoryItem(userId, inventoryId) {
  const transaction = await sequelize.transaction();
  try {
    // 1. Verificar que el item existe en el inventario del usuario
    const inventoryItems = await rewardRepository.findUserRewardInventory(userId, { transaction });
    const inventoryItem = inventoryItems.find(item => item.id_inventory === inventoryId);

    if (!inventoryItem) {
      throw new NotFoundError('Item no encontrado en tu inventario');
    }

    if (inventoryItem.id_user_profile !== userId) {
      throw new NotFoundError('Este item no te pertenece');
    }

    // 2. Verificar que el item es un token_multiplier
    if (inventoryItem.item_type !== 'token_multiplier') {
      throw new ValidationError('Solo puedes activar multiplicadores de tokens desde el inventario');
    }

    // 3. Obtener la recompensa asociada para obtener effect_value y duration_days
    const reward = await rewardRepository.findRewardById(inventoryItem.id_reward, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa asociada no encontrada');
    }

    // 4. Activar el efecto
    const effect = await activateTokenMultiplier(
      userId,
      reward.effect_value || 2,
      reward.duration_days || 7,
      { transaction }
    );

    // 5. Decrementar cantidad en inventario
    const newQuantity = inventoryItem.quantity - 1;
    if (newQuantity <= 0) {
      // Eliminar del inventario si llega a 0
      await rewardRepository.deleteInventoryEntry(inventoryId, { transaction });
    } else {
      // Actualizar cantidad
      await rewardRepository.updateInventoryQuantity(inventoryId, newQuantity, { transaction });
    }

    await transaction.commit();
    return effect;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getAvailableRewardsForUser(userId) {
  const userProfile = await userProfileRepository.findById(userId);
  if (!userProfile) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const rewardsResult = await rewardRepository.findRewards({
    is_active: true,
    available_only: true,
    page: 1,
    limit: 200,
  });

  const [inventoryEntries, cooldownEntries] = await Promise.all([
    rewardRepository.findUserRewardInventory(userId),
    rewardRepository.findRewardCooldownsByUser(userId),
  ]);

  const inventoryMap = new Map();
  inventoryEntries.forEach((entry) => {
    inventoryMap.set(entry.id_reward, entry);
  });

  const cooldownMap = new Map();
  cooldownEntries.forEach((entry) => {
    cooldownMap.set(entry.id_reward, entry);
  });

  const enrichedItems = [];
  for (const reward of rewardsResult.items) {
    const validation = await canClaimReward(userId, reward, {
      preloaded: {
        inventoryMap,
        cooldownMap,
      },
    });

    const inventoryEntry = inventoryMap.get(reward.id_reward);
    const cooldownEntry = cooldownMap.get(reward.id_reward);
    const cooldownEndsAt = cooldownEntry ? new Date(cooldownEntry.can_claim_again_at) : null;
    const now = new Date();

    enrichedItems.push({
      ...reward,
      current_stack: inventoryEntry ? inventoryEntry.quantity : 0,
      can_claim: validation.canClaim,
      reason: validation.canClaim ? null : validation.reason,
      cooldown_ends_at: cooldownEndsAt,
      cooldown_hours_remaining:
        cooldownEndsAt && cooldownEndsAt > now
          ? Math.ceil((cooldownEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60))
          : null,
    });
  }

  return {
    items: enrichedItems,
    page: rewardsResult.page,
    limit: rewardsResult.limit,
    total: rewardsResult.total,
    totalPages: rewardsResult.totalPages,
  };
}

async function applyRewardEffect(userId, rewardType, effectValue, options = {}) {
  const { transaction } = options;

  switch (rewardType.toLowerCase()) {
    case 'pase_gratis': {
      // Extender o activar subscripción premium por X días
      const userProfile = await UserProfile.findByPk(userId, { transaction });
      if (!userProfile) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const now = new Date();
      let newExpirationDate;

      // Si el usuario ya tiene premium activo, extender la fecha de expiración
      if (
        userProfile.app_tier === 'PREMIUM' &&
        userProfile.premium_expires &&
        new Date(userProfile.premium_expires) > now
      ) {
        // Extender desde la fecha de expiración actual
        const currentExpiration = new Date(userProfile.premium_expires);
        newExpirationDate = new Date(currentExpiration);
        newExpirationDate.setDate(newExpirationDate.getDate() + effectValue);
      } else {
        // Activar premium desde ahora
        newExpirationDate = new Date(now);
        newExpirationDate.setDate(newExpirationDate.getDate() + effectValue);
      }

      // Actualizar el perfil
      await userProfile.update(
        {
          app_tier: 'PREMIUM',
          premium_since: userProfile.premium_since || now,
          premium_expires: newExpirationDate,
        },
        { transaction }
      );
      break;
    }

    case 'descuento': {
      // Para descuentos, el efecto podría almacenarse en metadata del ClaimedReward
      // o en una tabla de descuentos pendientes. Por ahora, no hacemos nada adicional
      // ya que el descuento se aplica al momento de usar la recompensa
      break;
    }

    case 'producto':
    case 'servicio':
    case 'merchandising':
    case 'otro': {
      // Estos tipos no requieren modificación automática del perfil
      // El efecto se aplica cuando el usuario presente la recompensa en el gimnasio
      break;
    }

    default: {
      // Tipo no reconocido, no hacer nada
      break;
    }
  }
}

/**
 * Lista recompensas canjeadas
 * @param {ListClaimedRewardsQuery} query
 * @returns {Promise<Object>} Resultado paginado con recompensas canjeadas (POJOs)
 */
async function listClaimedRewards(query) {
  return rewardRepository.findClaimedRewards(query);
}

/**
 * Obtiene una recompensa canjeada por ID
 * @param {GetClaimedRewardByIdQuery} query
 * @returns {Promise<Object|null>} Recompensa canjeada (POJO)
 */
async function getClaimedReward(query) {
  const claimed = await rewardRepository.findClaimedRewardById(query.claimedRewardId);
  if (!claimed) {
    throw new NotFoundError('Recompensa canjeada no encontrada');
  }

  // Validar ownership si se proporciona userId
  if (query.userId && claimed.id_user_profile !== query.userId) {
    throw new NotFoundError('Recompensa canjeada no encontrada');
  }

  return claimed;
}

/**
 * Canjea una recompensa por tokens
 * @param {ClaimRewardCommand} command
 * @returns {Promise<Object>} Recompensa canjeada (POJO)
 */
async function claimReward(command) {
  const transaction = await sequelize.transaction();
  try {
    // 1. Verificar recompensa existe y está disponible
    const reward = await rewardRepository.findRewardById(command.rewardId, { transaction });
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    if (!reward.is_active) {
      throw new ValidationError('La recompensa no está activa');
    }

    // Validar fechas de validez
    const now = new Date();
    if (reward.valid_from && new Date(reward.valid_from) > now) {
      throw new ValidationError('La recompensa aún no está disponible');
    }
    if (reward.valid_until && new Date(reward.valid_until) < now) {
      throw new ValidationError('La recompensa ha expirado');
    }

    // Validar stock
    if (!reward.is_unlimited && reward.stock !== null && reward.stock <= 0) {
      throw new ValidationError('La recompensa no tiene stock disponible');
    }

    const validation = await canClaimReward(command.userId, reward, { transaction });
    if (!validation.canClaim) {
      throw new ValidationError(validation.reason);
    }

    // 2. Verificar que el usuario tiene suficientes tokens
    const balance = await rewardRepository.getTokenBalance(command.userId, { transaction });
    const tokensRequired = reward.token_cost;
    command.tokens_spent = tokensRequired;
    if (balance < command.tokens_spent) {
      throw new ValidationError('Saldo insuficiente de tokens');
    }

    // 3. Validar código si se proporciona
    let codeToUse = null;
    if (command.codeId) {
      codeToUse = await rewardRepository.findRewardCodeById(command.codeId, { transaction });
      if (!codeToUse || codeToUse.is_used) {
        throw new ValidationError('Código no válido o ya utilizado');
      }
      if (codeToUse.id_reward !== command.rewardId) {
        throw new ValidationError('El código no corresponde a esta recompensa');
      }
    }

    // 4. Crear claimed reward
    const claimedPayload = {
      id_user_profile: command.userId,
      id_reward: command.rewardId,
      id_code: command.codeId,
      claimed_date: new Date(),
      status: 'ACTIVE',
      tokens_spent: command.tokens_spent,
      expires_at: command.expires_at,
    };

    const claimed = await rewardRepository.createClaimedReward(claimedPayload, { transaction });

    // 5. Crear entrada en token ledger (gasto)
    const previousBalance = balance;
    const newBalance = previousBalance - command.tokens_spent;

    await rewardRepository.createTokenLedgerEntry(
      {
        id_user_profile: command.userId,
        delta: -command.tokens_spent,
        balance_after: newBalance,
        reason: 'REWARD_CLAIM',
        ref_type: 'ClaimedReward',
        ref_id: claimed.id_claimed_reward,
        metadata: {
          reward_name: reward.name,
          reward_id: reward.id_reward,
        },
      },
      { transaction }
    );

    // 6. Actualizar balance en UserProfile
    await userProfileRepository.updateTokensBalance(command.userId, newBalance, { transaction });

    // 7. Decrementar stock si no es ilimitado
    if (!reward.is_unlimited && reward.stock !== null) {
      await rewardRepository.decrementRewardStock(command.rewardId, 1, { transaction });
    }

    // 8. Marcar código como usado si se usó
    if (codeToUse) {
      await rewardRepository.markRewardCodeAsUsed(command.codeId, { transaction });
    }

    // 9. Aplicar efectos de la recompensa según reward_type y effect_value
    if (reward.is_stackable) {
      // Solo agregar al inventario, NO activar automáticamente
      await addToInventory(command.userId, reward, 1, { transaction });

      // Streak saver se agrega automáticamente como recovery items
      if (reward.reward_type === 'streak_saver') {
        await incrementStreakRecoveryItems(command.userId, reward.effect_value || 1, { transaction });
      }

      // token_multiplier NO se activa automáticamente, queda en inventario para uso manual
    } else if (reward.reward_type && reward.effect_value) {
      await applyRewardEffect(command.userId, reward.reward_type, reward.effect_value, { transaction });
    }

    if (reward.cooldown_days > 0) {
      await updateCooldown(command.userId, reward.id_reward, reward.cooldown_days, { transaction });
    }

    await transaction.commit();

    // Retornar claimed reward con todas las relaciones
    return rewardRepository.findClaimedRewardById(claimed.id_claimed_reward);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Marca una recompensa canjeada como usada
 * @param {MarkClaimedRewardUsedCommand} command
 * @returns {Promise<Object>} Recompensa canjeada actualizada (POJO)
 */
async function markClaimedRewardAsUsed(command) {
  const transaction = await sequelize.transaction();
  try {
    // Verificar que existe y pertenece al usuario
    const claimed = await rewardRepository.findClaimedRewardById(command.claimedRewardId, { transaction });
    if (!claimed) {
      throw new NotFoundError('Recompensa canjeada no encontrada');
    }

    if (claimed.id_user_profile !== command.userId) {
      throw new NotFoundError('Recompensa canjeada no encontrada');
    }

    if (claimed.status === 'USED') {
      throw new ConflictError('La recompensa ya fue utilizada');
    }

    if (claimed.status === 'EXPIRED') {
      throw new ValidationError('La recompensa ha expirado');
    }

    const updated = await rewardRepository.markClaimedRewardAsUsed(command.claimedRewardId, { transaction });
    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Mantener nombres antiguos para compatibilidad con código existente
const listarRecompensas = listRewards;
const obtenerRecompensaPorId = getReward;
const crearRecompensa = createReward;
const actualizarRecompensa = updateReward;
const eliminarRecompensa = deleteReward;
const canjearRecompensa = claimReward;

module.exports = {
  // New API
  listRewards,
  getReward,
  createReward,
  updateReward,
  deleteReward,
  listRewardCodes,
  getRewardCodeByString,
  createRewardCode,
  listClaimedRewards,
  getClaimedReward,
  claimReward,
  markClaimedRewardAsUsed,
  getUserRewardInventory,
  getActiveEffectsForUser,
  getAvailableRewardsForUser,
  getActiveMultiplier,
  useInventoryItem,

  // Legacy API
  listarRecompensas,
  obtenerRecompensaPorId,
  crearRecompensa,
  actualizarRecompensa,
  eliminarRecompensa,
  canjearRecompensa,
};
