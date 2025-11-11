/**
 * Mappers para el dominio Rewards & Tokens
 *
 * Transforman entre DTOs (API) ↔ Commands/Queries ↔ Entidades (dominio)
 *
 * Flujo:
 * - Request: RequestDTO → Command/Query (toXCommand/toXQuery)
 * - Response: Entity/POJO → ResponseDTO (toXDTO/toXResponse)
 */

const {
  CreateRewardCommand,
  UpdateRewardCommand,
  DeleteRewardCommand,
  CreateRewardCodeCommand,
  ClaimRewardCommand,
  MarkClaimedRewardUsedCommand,
  AddTokensCommand,
  SpendTokensCommand,
} = require('../commands/reward.commands');

const {
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
} = require('../queries/reward.queries');

// ============================================================================
// RequestDTO → Command
// ============================================================================

/**
 * Mapea CreateRewardRequestDTO a CreateRewardCommand
 */
function toCreateRewardCommand(dto, createdBy, gymId = null) {
  return new CreateRewardCommand({
    gymId,
    name: dto.name,
    description: dto.description,
    reward_type: dto.reward_type || null,
    effect_value: dto.effect_value ?? null,
    token_cost: dto.token_cost,
    discount_percentage: dto.discount_percentage ?? null,
    discount_amount: dto.discount_amount ?? null,
    stock: dto.stock ?? null,
    cooldown_days: dto.cooldown_days ?? 0,
    is_unlimited: dto.is_unlimited ?? false,
    requires_premium: dto.requires_premium ?? false,
    is_stackable: dto.is_stackable ?? false,
    max_stack: dto.max_stack ?? 1,
    duration_days: dto.duration_days ?? null,
    valid_from: dto.valid_from ? new Date(dto.valid_from) : null,
    valid_until: dto.valid_until ? new Date(dto.valid_until) : null,
    is_active: dto.is_active !== undefined ? dto.is_active : true,
    image_url: dto.image_url || null,
    terms: dto.terms || null,
    createdBy,
  });
}

/**
 * Mapea UpdateRewardRequestDTO a UpdateRewardCommand
 */
function toUpdateRewardCommand(dto, rewardId, updatedBy) {
  return new UpdateRewardCommand({
    rewardId,
    name: dto.name,
    description: dto.description,
    reward_type: dto.reward_type,
    effect_value: dto.effect_value,
    token_cost: dto.token_cost,
    discount_percentage: dto.discount_percentage,
    discount_amount: dto.discount_amount,
    stock: dto.stock,
    cooldown_days: dto.cooldown_days,
    is_unlimited: dto.is_unlimited,
    requires_premium: dto.requires_premium,
    is_stackable: dto.is_stackable,
    max_stack: dto.max_stack,
    duration_days: dto.duration_days,
    valid_from: dto.valid_from ? new Date(dto.valid_from) : undefined,
    valid_until: dto.valid_until ? new Date(dto.valid_until) : undefined,
    is_active: dto.is_active,
    image_url: dto.image_url,
    terms: dto.terms,
    updatedBy,
  });
}

/**
 * Mapea a DeleteRewardCommand
 */
function toDeleteRewardCommand(rewardId, deletedBy) {
  return new DeleteRewardCommand({ rewardId, deletedBy });
}

/**
 * Mapea CreateRewardCodeRequestDTO a CreateRewardCodeCommand
 */
function toCreateRewardCodeCommand(dto, rewardId, createdBy) {
  return new CreateRewardCodeCommand({
    rewardId,
    code: dto.code,
    createdBy,
  });
}

/**
 * Mapea ClaimRewardRequestDTO a ClaimRewardCommand
 */
function toClaimRewardCommand(dto, userId, rewardId) {
  return new ClaimRewardCommand({
    userId,
    rewardId,
    codeId: dto.code_id || null,
    tokens_spent: dto.tokens_spent,
    expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
  });
}

/**
 * Mapea a MarkClaimedRewardUsedCommand
 */
function toMarkClaimedRewardUsedCommand(claimedRewardId, userId) {
  return new MarkClaimedRewardUsedCommand({ claimedRewardId, userId });
}

/**
 * Mapea AddTokensRequestDTO a AddTokensCommand
 */
function toAddTokensCommand(dto, userId) {
  return new AddTokensCommand({
    userId,
    amount: dto.amount,
    reason: dto.reason,
    ref_type: dto.ref_type || null,
    ref_id: dto.ref_id || null,
    metadata: dto.metadata || null,
  });
}

/**
 * Mapea SpendTokensRequestDTO a SpendTokensCommand
 */
function toSpendTokensCommand(dto, userId) {
  return new SpendTokensCommand({
    userId,
    amount: dto.amount,
    reason: dto.reason,
    ref_type: dto.ref_type || null,
    ref_id: dto.ref_id || null,
    metadata: dto.metadata || null,
  });
}

// ============================================================================
// RequestDTO → Query
// ============================================================================

/**
 * Mapea query params a ListRewardsQuery
 */
function toListRewardsQuery(queryParams = {}) {
  return new ListRewardsQuery({
    gymId: queryParams.gymId ? Number.parseInt(queryParams.gymId, 10) : null,
    is_active: queryParams.is_active === undefined || queryParams.is_active === 'true',
    min_cost: queryParams.min_cost ? Number.parseInt(queryParams.min_cost, 10) : null,
    max_cost: queryParams.max_cost ? Number.parseInt(queryParams.max_cost, 10) : null,
    available_only: queryParams.available_only === 'true',
    page: queryParams.page ? Number.parseInt(queryParams.page, 10) : 1,
    limit: queryParams.limit ? Number.parseInt(queryParams.limit, 10) : 20,
    sortBy: queryParams.sortBy || 'created_at',
    order: queryParams.order || 'desc',
  });
}

/**
 * Mapea a GetRewardByIdQuery
 */
function toGetRewardByIdQuery(rewardId) {
  return new GetRewardByIdQuery({ rewardId: Number.parseInt(rewardId, 10) });
}

/**
 * Mapea a ListRewardCodesQuery
 */
function toListRewardCodesQuery(rewardId, queryParams = {}) {
  return new ListRewardCodesQuery({
    rewardId: Number.parseInt(rewardId, 10),
    unused_only: queryParams.unused_only === 'true',
  });
}

/**
 * Mapea a GetRewardCodeByStringQuery
 */
function toGetRewardCodeByStringQuery(code) {
  return new GetRewardCodeByStringQuery({ code });
}

/**
 * Mapea a GetRewardCodeByIdQuery
 */
function toGetRewardCodeByIdQuery(codeId) {
  return new GetRewardCodeByIdQuery({ codeId: Number.parseInt(codeId, 10) });
}

/**
 * Mapea query params a ListClaimedRewardsQuery
 */
function toListClaimedRewardsQuery(userId, queryParams = {}) {
  return new ListClaimedRewardsQuery({
    userId: Number.parseInt(userId, 10),
    status: queryParams.status || null,
    gymId: queryParams.gymId ? Number.parseInt(queryParams.gymId, 10) : null,
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
    page: queryParams.page ? Number.parseInt(queryParams.page, 10) : 1,
    limit: queryParams.limit ? Number.parseInt(queryParams.limit, 10) : 20,
    sortBy: queryParams.sortBy || 'claimed_date',
    order: queryParams.order || 'desc',
  });
}

/**
 * Mapea a GetClaimedRewardByIdQuery
 */
function toGetClaimedRewardByIdQuery(claimedRewardId, userId) {
  return new GetClaimedRewardByIdQuery({
    claimedRewardId: Number.parseInt(claimedRewardId, 10),
    userId: userId ? Number.parseInt(userId, 10) : null,
  });
}

/**
 * Mapea a GetTokenBalanceQuery
 */
function toGetTokenBalanceQuery(userId) {
  return new GetTokenBalanceQuery({ userId: Number.parseInt(userId, 10) });
}

/**
 * Mapea query params a ListTokenLedgerQuery
 */
function toListTokenLedgerQuery(userId, queryParams = {}) {
  return new ListTokenLedgerQuery({
    userId: Number.parseInt(userId, 10),
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
    ref_type: queryParams.ref_type || null,
    page: queryParams.page ? Number.parseInt(queryParams.page, 10) : 1,
    limit: queryParams.limit ? Number.parseInt(queryParams.limit, 10) : 50,
    sortBy: queryParams.sortBy || 'created_at',
    order: queryParams.order || 'desc',
  });
}

/**
 * Mapea query params a GetRewardStatsQuery
 */
function toGetRewardStatsQuery(gymId, queryParams = {}) {
  return new GetRewardStatsQuery({
    gymId: Number.parseInt(gymId, 10),
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
  });
}

/**
 * Mapea query params a GetGlobalRewardStatsQuery
 */
function toGetGlobalRewardStatsQuery(queryParams = {}) {
  return new GetGlobalRewardStatsQuery({
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
  });
}

// ============================================================================
// Entity → ResponseDTO
// ============================================================================

/**
 * Helper: Formatea fecha a string YYYY-MM-DD
 */
function formatDateToString(date) {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

/**
 * Helper: Formatea fecha/hora a ISO string
 */
function formatDateTimeToISO(date) {
  if (!date) return null;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return null;
}

/**
 * Mapea entidad Reward a RewardResponseDTO
 */
function toRewardDTO(reward) {
  return {
    id_reward: reward.id_reward,
    id_gym: reward.id_gym,
    name: reward.name,
    description: reward.description || null,
    reward_type: reward.reward_type,
    effect_value: reward.effect_value || null,
    token_cost: reward.token_cost,
    cooldown_days: reward.cooldown_days !== undefined ? reward.cooldown_days : null,
    is_unlimited: reward.is_unlimited !== undefined ? reward.is_unlimited : null,
    requires_premium: reward.requires_premium !== undefined ? reward.requires_premium : null,
    is_stackable: reward.is_stackable !== undefined ? reward.is_stackable : null,
    max_stack: reward.max_stack !== undefined ? reward.max_stack : null,
    duration_days: reward.duration_days !== undefined ? reward.duration_days : null,
    discount_percentage: reward.discount_percentage || null,
    discount_amount: reward.discount_amount || null,
    stock: reward.stock,
    valid_from: formatDateToString(reward.valid_from),
    valid_until: formatDateToString(reward.valid_until),
    is_active: reward.is_active,
    image_url: reward.image_url || null,
    terms: reward.terms || null,
    can_claim: reward.can_claim !== undefined ? reward.can_claim : null,
    current_stack: reward.current_stack !== undefined ? reward.current_stack : null,
    cooldown_ends_at: reward.cooldown_ends_at ? formatDateTimeToISO(reward.cooldown_ends_at) : null,
    cooldown_hours_remaining: reward.cooldown_hours_remaining !== undefined ? reward.cooldown_hours_remaining : null,
    reason: reward.reason || null,
    created_at: reward.created_at ? reward.created_at.toISOString() : null,
    updated_at: reward.updated_at ? reward.updated_at.toISOString() : null,
    gym: reward.Gym ? toGymSummaryDTO(reward.Gym) : null,
  };
}

/**
 * Mapea array de recompensas a PaginatedRewardsDTO
 */
function toPaginatedRewardsDTO(result) {
  return {
    items: result.items.map(toRewardDTO),
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  };
}

/**
 * Mapea entidad RewardCode a RewardCodeResponseDTO
 */
function toRewardCodeDTO(code) {
  return {
    id_code: code.id_code,
    id_reward: code.id_reward,
    code: code.code,
    is_used: code.is_used,
    created_at: code.created_at ? code.created_at.toISOString() : null,
  };
}

/**
 * Mapea entidad ClaimedReward a ClaimedRewardResponseDTO
 */
function toClaimedRewardDTO(claimedReward) {
  return {
    id_claimed_reward: claimedReward.id_claimed_reward,
    id_user_profile: claimedReward.id_user_profile,
    id_reward: claimedReward.id_reward,
    id_code: claimedReward.id_code,
    claimed_date: formatDateTimeToISO(claimedReward.claimed_date),
    status: claimedReward.status,
    tokens_spent: claimedReward.tokens_spent,
    used_at: formatDateTimeToISO(claimedReward.used_at),
    expires_at: formatDateTimeToISO(claimedReward.expires_at),
    reward: claimedReward.reward ? toRewardDTO(claimedReward.reward) : null,
    code: claimedReward.code ? toRewardCodeDTO(claimedReward.code) : null,
  };
}

/**
 * Mapea array de claimed rewards a PaginatedClaimedRewardsDTO
 */
function toPaginatedClaimedRewardsDTO(result) {
  return {
    items: result.items.map(toClaimedRewardDTO),
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  };
}

/**
 * Mapea entidad TokenLedger a TokenLedgerEntryDTO
 */
function toTokenLedgerEntryDTO(entry) {
  return {
    id_ledger: entry.id_ledger,
    id_user_profile: entry.id_user_profile,
    delta: entry.delta,
    balance_after: entry.balance_after,
    reason: entry.reason,
    ref_type: entry.ref_type || null,
    ref_id: entry.ref_id || null,
    metadata: entry.metadata || null,
    created_at: entry.created_at ? entry.created_at.toISOString() : null,
  };
}

/**
 * Mapea array de ledger entries a PaginatedTokenLedgerDTO
 */
function toPaginatedTokenLedgerDTO(result) {
  return {
    items: result.items.map(toTokenLedgerEntryDTO),
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  };
}

/**
 * Mapea balance de tokens a TokenBalanceDTO
 */
function toTokenBalanceDTO(userId, balance) {
  return {
    id_user_profile: userId,
    balance: balance,
  };
}

/**
 * Mapea estadísticas de recompensas a RewardStatsDTO
 */
function toRewardStatsDTO(stats) {
  return {
    total_rewards_claimed: stats.total_rewards_claimed || 0,
    total_tokens_spent: stats.total_tokens_spent || 0,
    unique_users: stats.unique_users || 0,
    most_claimed_rewards: stats.most_claimed_rewards || [],
  };
}

/**
 * Helper: Mapea Gym a resumen
 */
function toGymSummaryDTO(gym) {
  if (!gym) return null;
  return {
    id_gym: gym.id_gym,
    name: gym.name,
    city: gym.city || null,
  };
}

function toUserRewardInventoryItemDTO(entry) {
  return {
    id_inventory: entry.id_inventory,
    id_reward: entry.id_reward,
    item_type: entry.item_type,
    quantity: entry.quantity,
    max_stack: entry.max_stack,
    created_at: entry.created_at ? entry.created_at.toISOString() : null,
    updated_at: entry.updated_at ? entry.updated_at.toISOString() : null,
    reward: entry.reward
      ? {
          id_reward: entry.reward.id_reward,
          name: entry.reward.name,
          description: entry.reward.description || null,
          image_url: entry.reward.image_url || null,
        }
      : null,
  };
}

function toUserRewardInventoryDTO(items) {
  return {
    inventory: items.map(toUserRewardInventoryItemDTO),
  };
}

function toActiveEffectEntryDTO(effect) {
  return {
    id_effect: effect.id_effect,
    effect_type: effect.effect_type,
    multiplier_value: effect.multiplier_value,
    started_at: formatDateTimeToISO(effect.started_at),
    expires_at: formatDateTimeToISO(effect.expires_at),
    hours_remaining: effect.hours_remaining,
  };
}

function toActiveEffectsResponseDTO(payload) {
  return {
    effects: payload.effects.map(toActiveEffectEntryDTO),
    total_multiplier: payload.total_multiplier,
  };
}

module.exports = {
  // RequestDTO → Command
  toCreateRewardCommand,
  toUpdateRewardCommand,
  toDeleteRewardCommand,
  toCreateRewardCodeCommand,
  toClaimRewardCommand,
  toMarkClaimedRewardUsedCommand,
  toAddTokensCommand,
  toSpendTokensCommand,

  // RequestDTO → Query
  toListRewardsQuery,
  toGetRewardByIdQuery,
  toListRewardCodesQuery,
  toGetRewardCodeByStringQuery,
  toGetRewardCodeByIdQuery,
  toListClaimedRewardsQuery,
  toGetClaimedRewardByIdQuery,
  toGetTokenBalanceQuery,
  toListTokenLedgerQuery,
  toGetRewardStatsQuery,
  toGetGlobalRewardStatsQuery,

  // Entity → ResponseDTO
  toRewardDTO,
  toPaginatedRewardsDTO,
  toRewardCodeDTO,
  toClaimedRewardDTO,
  toPaginatedClaimedRewardsDTO,
  toTokenLedgerEntryDTO,
  toPaginatedTokenLedgerDTO,
  toTokenBalanceDTO,
  toRewardStatsDTO,
  toUserRewardInventoryDTO,
  toActiveEffectsResponseDTO,
};
