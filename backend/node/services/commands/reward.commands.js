/**
 * Commands para el dominio Rewards & Tokens
 *
 * Los Commands son objetos puros (POJOs) que representan una intención
 * de modificar el estado del sistema. No contienen lógica de negocio.
 *
 * Cobertura:
 * - Reward: Recompensas que los usuarios pueden canjear
 * - RewardCode: Códigos únicos para canjear recompensas
 * - ClaimedReward: Registro de recompensas canjeadas por usuarios
 * - TokenLedger: Historial de movimientos de tokens
 */

/**
 * Command para crear una recompensa
 *
 * @typedef {Object} CreateRewardCommand
 * @property {number|null} gymId - ID del gimnasio (null para recompensas globales)
 * @property {string} name - Nombre de la recompensa
 * @property {string} description - Descripción
 * @property {number} token_cost - Costo en tokens
 * @property {number|null} discount_percentage - Porcentaje de descuento
 * @property {number|null} discount_amount - Monto fijo de descuento
 * @property {number|null} stock - Stock disponible (null = ilimitado)
 * @property {Date|null} valid_from - Fecha inicio validez
 * @property {Date|null} valid_until - Fecha fin validez
 * @property {boolean} is_active - Si está activa
 * @property {string|null} image_url - URL de imagen
 * @property {string|null} terms - Términos y condiciones
 * @property {number} createdBy - ID del admin que crea
 */
class CreateRewardCommand {
  constructor({
    gymId = null,
    name,
    description,
    token_cost,
    discount_percentage = null,
    discount_amount = null,
    stock = null,
    valid_from = null,
    valid_until = null,
    is_active = true,
    image_url = null,
    terms = null,
    createdBy,
  }) {
    this.gymId = gymId;
    this.name = name;
    this.description = description;
    this.token_cost = token_cost;
    this.discount_percentage = discount_percentage;
    this.discount_amount = discount_amount;
    this.stock = stock;
    this.valid_from = valid_from;
    this.valid_until = valid_until;
    this.is_active = is_active;
    this.image_url = image_url;
    this.terms = terms;
    this.createdBy = createdBy;
  }
}

/**
 * Command para actualizar una recompensa
 *
 * @typedef {Object} UpdateRewardCommand
 * @property {number} rewardId - ID de la recompensa
 * @property {string} [name] - Nombre
 * @property {string} [description] - Descripción
 * @property {number} [token_cost] - Costo en tokens
 * @property {number|null} [discount_percentage] - Porcentaje de descuento
 * @property {number|null} [discount_amount] - Monto de descuento
 * @property {number|null} [stock] - Stock
 * @property {Date|null} [valid_from] - Fecha inicio
 * @property {Date|null} [valid_until] - Fecha fin
 * @property {boolean} [is_active] - Si está activa
 * @property {string|null} [image_url] - URL imagen
 * @property {string|null} [terms] - Términos
 * @property {number} updatedBy - ID del admin que actualiza
 */
class UpdateRewardCommand {
  constructor({
    rewardId,
    name,
    description,
    token_cost,
    discount_percentage,
    discount_amount,
    stock,
    valid_from,
    valid_until,
    is_active,
    image_url,
    terms,
    updatedBy,
  }) {
    this.rewardId = rewardId;
    this.name = name;
    this.description = description;
    this.token_cost = token_cost;
    this.discount_percentage = discount_percentage;
    this.discount_amount = discount_amount;
    this.stock = stock;
    this.valid_from = valid_from;
    this.valid_until = valid_until;
    this.is_active = is_active;
    this.image_url = image_url;
    this.terms = terms;
    this.updatedBy = updatedBy;
  }
}

/**
 * Command para eliminar una recompensa (soft delete)
 *
 * @typedef {Object} DeleteRewardCommand
 * @property {number} rewardId - ID de la recompensa
 * @property {number} deletedBy - ID del admin que elimina
 */
class DeleteRewardCommand {
  constructor({ rewardId, deletedBy }) {
    this.rewardId = rewardId;
    this.deletedBy = deletedBy;
  }
}

/**
 * Command para crear códigos de recompensa
 *
 * @typedef {Object} CreateRewardCodeCommand
 * @property {number} rewardId - ID de la recompensa
 * @property {string} code - Código único
 * @property {number} createdBy - ID del admin que crea
 */
class CreateRewardCodeCommand {
  constructor({ rewardId, code, createdBy }) {
    this.rewardId = rewardId;
    this.code = code.toUpperCase();
    this.createdBy = createdBy;
  }
}

/**
 * Command para canjear una recompensa
 *
 * @typedef {Object} ClaimRewardCommand
 * @property {number} userId - ID del usuario
 * @property {number} rewardId - ID de la recompensa
 * @property {number|null} codeId - ID del código usado (si aplica)
 * @property {number} tokens_spent - Tokens gastados
 * @property {Date|null} expires_at - Fecha de expiración
 */
class ClaimRewardCommand {
  constructor({
    userId,
    rewardId,
    codeId = null,
    tokens_spent,
    expires_at = null,
  }) {
    this.userId = userId;
    this.rewardId = rewardId;
    this.codeId = codeId;
    this.tokens_spent = tokens_spent;
    this.expires_at = expires_at;
  }
}

/**
 * Command para marcar una recompensa canjeada como usada
 *
 * @typedef {Object} MarkClaimedRewardUsedCommand
 * @property {number} claimedRewardId - ID de la recompensa canjeada
 * @property {number} userId - ID del usuario (para validación)
 */
class MarkClaimedRewardUsedCommand {
  constructor({ claimedRewardId, userId }) {
    this.claimedRewardId = claimedRewardId;
    this.userId = userId;
  }
}

/**
 * Command para añadir tokens a un usuario
 *
 * @typedef {Object} AddTokensCommand
 * @property {number} userId - ID del usuario
 * @property {number} amount - Cantidad de tokens a añadir
 * @property {string} reason - Razón del movimiento
 * @property {string|null} ref_type - Tipo de referencia (ej: "CHECKIN", "PURCHASE")
 * @property {number|null} ref_id - ID de la referencia
 * @property {Object|null} metadata - Metadatos adicionales
 */
class AddTokensCommand {
  constructor({
    userId,
    amount,
    reason,
    ref_type = null,
    ref_id = null,
    metadata = null,
  }) {
    this.userId = userId;
    this.amount = Math.abs(amount); // Asegurar positivo
    this.reason = reason;
    this.ref_type = ref_type;
    this.ref_id = ref_id;
    this.metadata = metadata;
  }
}

/**
 * Command para gastar tokens de un usuario
 *
 * @typedef {Object} SpendTokensCommand
 * @property {number} userId - ID del usuario
 * @property {number} amount - Cantidad de tokens a gastar
 * @property {string} reason - Razón del movimiento
 * @property {string|null} ref_type - Tipo de referencia (ej: "REWARD_CLAIM")
 * @property {number|null} ref_id - ID de la referencia
 * @property {Object|null} metadata - Metadatos adicionales
 */
class SpendTokensCommand {
  constructor({
    userId,
    amount,
    reason,
    ref_type = null,
    ref_id = null,
    metadata = null,
  }) {
    this.userId = userId;
    this.amount = -Math.abs(amount); // Asegurar negativo
    this.reason = reason;
    this.ref_type = ref_type;
    this.ref_id = ref_id;
    this.metadata = metadata;
  }
}

module.exports = {
  CreateRewardCommand,
  UpdateRewardCommand,
  DeleteRewardCommand,
  CreateRewardCodeCommand,
  ClaimRewardCommand,
  MarkClaimedRewardUsedCommand,
  AddTokensCommand,
  SpendTokensCommand,
};
