/**
 * Queries para el dominio Rewards & Tokens
 *
 * Las Queries son objetos puros (POJOs) que representan una solicitud
 * de lectura de datos. No modifican el estado del sistema.
 *
 * Cobertura:
 * - Reward: Recompensas disponibles
 * - RewardCode: Códigos de recompensa
 * - ClaimedReward: Recompensas canjeadas
 * - TokenLedger: Historial de tokens
 * - RewardGymStatsDaily: Estadísticas de recompensas
 */

/**
 * Query para listar recompensas
 *
 * @typedef {Object} ListRewardsQuery
 * @property {number|null} gymId - Filtrar por gimnasio (null = globales)
 * @property {boolean} [is_active] - Solo activas
 * @property {number} [min_cost] - Costo mínimo en tokens
 * @property {number} [max_cost] - Costo máximo en tokens
 * @property {boolean} [available_only] - Solo con stock disponible
 * @property {number} [page=1] - Página
 * @property {number} [limit=20] - Límite por página
 * @property {string} [sortBy='created_at'] - Campo de ordenamiento
 * @property {string} [order='desc'] - Dirección del orden
 */
class ListRewardsQuery {
  constructor({
    gymId = null,
    is_active = true,
    min_cost = null,
    max_cost = null,
    available_only = false,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    order = 'desc',
  }) {
    this.gymId = gymId;
    this.is_active = is_active;
    this.min_cost = min_cost;
    this.max_cost = max_cost;
    this.available_only = available_only;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
  }
}

/**
 * Query para obtener una recompensa por ID
 *
 * @typedef {Object} GetRewardByIdQuery
 * @property {number} rewardId - ID de la recompensa
 */
class GetRewardByIdQuery {
  constructor({ rewardId }) {
    this.rewardId = rewardId;
  }
}

/**
 * Query para listar códigos de una recompensa
 *
 * @typedef {Object} ListRewardCodesQuery
 * @property {number} rewardId - ID de la recompensa
 * @property {boolean} [unused_only=false] - Solo códigos no usados
 */
class ListRewardCodesQuery {
  constructor({ rewardId, unused_only = false }) {
    this.rewardId = rewardId;
    this.unused_only = unused_only;
  }
}

/**
 * Query para obtener un código por su string
 *
 * @typedef {Object} GetRewardCodeByStringQuery
 * @property {string} code - Código a buscar
 */
class GetRewardCodeByStringQuery {
  constructor({ code }) {
    this.code = code.toUpperCase();
  }
}

/**
 * Query para obtener un código por ID
 *
 * @typedef {Object} GetRewardCodeByIdQuery
 * @property {number} codeId - ID del código
 */
class GetRewardCodeByIdQuery {
  constructor({ codeId }) {
    this.codeId = codeId;
  }
}

/**
 * Query para listar recompensas canjeadas
 *
 * @typedef {Object} ListClaimedRewardsQuery
 * @property {number} userId - ID del usuario
 * @property {string|null} [status] - Filtrar por estado (PENDING/ACTIVE/USED/EXPIRED)
 * @property {number|null} [gymId] - Filtrar por gimnasio
 * @property {Date|null} [from_date] - Fecha desde
 * @property {Date|null} [to_date] - Fecha hasta
 * @property {number} [page=1] - Página
 * @property {number} [limit=20] - Límite
 * @property {string} [sortBy='claimed_date'] - Campo de ordenamiento
 * @property {string} [order='desc'] - Dirección
 */
class ListClaimedRewardsQuery {
  constructor({
    userId,
    status = null,
    gymId = null,
    from_date = null,
    to_date = null,
    page = 1,
    limit = 20,
    sortBy = 'claimed_date',
    order = 'desc',
  }) {
    this.userId = userId;
    this.status = status;
    this.gymId = gymId;
    this.from_date = from_date;
    this.to_date = to_date;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
  }
}

/**
 * Query para obtener una recompensa canjeada por ID
 *
 * @typedef {Object} GetClaimedRewardByIdQuery
 * @property {number} claimedRewardId - ID de la recompensa canjeada
 * @property {number|null} [userId] - ID del usuario (para validación)
 */
class GetClaimedRewardByIdQuery {
  constructor({ claimedRewardId, userId = null }) {
    this.claimedRewardId = claimedRewardId;
    this.userId = userId;
  }
}

/**
 * Query para obtener el balance de tokens de un usuario
 *
 * @typedef {Object} GetTokenBalanceQuery
 * @property {number} userId - ID del usuario
 */
class GetTokenBalanceQuery {
  constructor({ userId }) {
    this.userId = userId;
  }
}

/**
 * Query para listar el historial de tokens (ledger)
 *
 * @typedef {Object} ListTokenLedgerQuery
 * @property {number} userId - ID del usuario
 * @property {Date|null} [from_date] - Fecha desde
 * @property {Date|null} [to_date] - Fecha hasta
 * @property {string|null} [ref_type] - Filtrar por tipo de referencia
 * @property {number} [page=1] - Página
 * @property {number} [limit=50] - Límite
 * @property {string} [sortBy='created_at'] - Campo de ordenamiento
 * @property {string} [order='desc'] - Dirección
 */
class ListTokenLedgerQuery {
  constructor({
    userId,
    from_date = null,
    to_date = null,
    ref_type = null,
    page = 1,
    limit = 50,
    sortBy = 'created_at',
    order = 'desc',
  }) {
    this.userId = userId;
    this.from_date = from_date;
    this.to_date = to_date;
    this.ref_type = ref_type;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
  }
}

/**
 * Query para obtener estadísticas de recompensas de un gimnasio
 *
 * @typedef {Object} GetRewardStatsQuery
 * @property {number} gymId - ID del gimnasio
 * @property {Date|null} [from_date] - Fecha desde
 * @property {Date|null} [to_date] - Fecha hasta
 */
class GetRewardStatsQuery {
  constructor({ gymId, from_date = null, to_date = null }) {
    this.gymId = gymId;
    this.from_date = from_date;
    this.to_date = to_date;
  }
}

/**
 * Query para obtener estadísticas globales de recompensas
 *
 * @typedef {Object} GetGlobalRewardStatsQuery
 * @property {Date|null} [from_date] - Fecha desde
 * @property {Date|null} [to_date] - Fecha hasta
 */
class GetGlobalRewardStatsQuery {
  constructor({ from_date = null, to_date = null }) {
    this.from_date = from_date;
    this.to_date = to_date;
  }
}

module.exports = {
  ListRewardsQuery,
  GetRewardByIdQuery,
  ListRewardCodesQuery,
  GetRewardCodeByStringQuery,
  GetRewardCodeByIdQuery,
  ListClaimedRewardsQuery,
  GetClaimedRewardByIdQuery,
  GetTokenBalanceQuery,
  ListTokenLedgerQuery,
  GetRewardStatsQuery,
  GetGlobalRewardStatsQuery,
};
