/**
 * Mappers para Daily Challenges
 * Transformaciones entre DTOs, Commands/Queries y Entidades
 */

const {
  CreateDailyChallengeCommand,
  UpdateDailyChallengeCommand,
  StartChallengeCommand,
  UpdateChallengeProgressCommand,
  ClaimChallengeRewardCommand,
  CreateChallengeTemplateCommand,
  UpdateChallengeTemplateCommand,
  UpdateChallengeSettingsCommand
} = require('../commands/challenge.commands');

const {
  GetTodayChallengeQuery,
  GetChallengeByIdQuery,
  ListChallengesQuery,
  GetUserChallengeProgressQuery,
  ListUserChallengesQuery,
  GetChallengeTemplateByIdQuery,
  ListChallengeTemplatesQuery,
  GetChallengeSettingsQuery
} = require('../queries/challenge.queries');

// ==================== RequestDTO → Command/Query ====================

function toCreateDailyChallengeCommand(dto) {
  return new CreateDailyChallengeCommand({
    challengeDate: dto.challenge_date || dto.challengeDate,
    title: dto.title,
    description: dto.description,
    challengeType: dto.challenge_type || dto.challengeType,
    targetValue: dto.target_value || dto.targetValue,
    targetUnit: dto.target_unit || dto.targetUnit,
    tokensReward: dto.tokens_reward || dto.tokensReward,
    difficulty: dto.difficulty,
    idTemplate: dto.id_template || dto.idTemplate || null
  });
}

function toUpdateDailyChallengeCommand(dto, idChallenge) {
  return new UpdateDailyChallengeCommand({
    idChallenge,
    title: dto.title,
    description: dto.description,
    challengeType: dto.challenge_type || dto.challengeType,
    targetValue: dto.target_value || dto.targetValue,
    targetUnit: dto.target_unit || dto.targetUnit,
    tokensReward: dto.tokens_reward || dto.tokensReward,
    difficulty: dto.difficulty,
    isActive: dto.is_active ?? dto.isActive
  });
}

function toStartChallengeCommand(idUserProfile, idChallenge) {
  return new StartChallengeCommand({ idUserProfile, idChallenge });
}

function toUpdateChallengeProgressCommand(dto, idUserProfile, idChallenge) {
  return new UpdateChallengeProgressCommand({
    idUserProfile,
    idChallenge,
    currentValue: dto.current_value || dto.currentValue
  });
}

function toClaimChallengeRewardCommand(idUserProfile, idChallenge) {
  return new ClaimChallengeRewardCommand({ idUserProfile, idChallenge });
}

function toGetTodayChallengeQuery(idUserProfile) {
  return new GetTodayChallengeQuery({ idUserProfile });
}

function toGetChallengeByIdQuery(idChallenge) {
  return new GetChallengeByIdQuery({ idChallenge });
}

function toListChallengesQuery(dto) {
  return new ListChallengesQuery({
    page: dto.page ? Number.parseInt(dto.page, 10) : 1,
    limit: dto.limit ? Number.parseInt(dto.limit, 10) : 20,
    sortBy: dto.sortBy || dto.sort_by || 'challenge_date',
    order: dto.order || 'DESC',
    startDate: dto.start_date || dto.startDate || null,
    endDate: dto.end_date || dto.endDate || null,
    challengeType: dto.challenge_type || dto.challengeType || null,
    difficulty: dto.difficulty || null,
    isActive: dto.is_active ?? dto.isActive ?? null
  });
}

function toGetUserChallengeProgressQuery(idUserProfile, idChallenge) {
  return new GetUserChallengeProgressQuery({ idUserProfile, idChallenge });
}

function toListUserChallengesQuery(dto, idUserProfile) {
  return new ListUserChallengesQuery({
    idUserProfile,
    page: dto.page ? Number.parseInt(dto.page, 10) : 1,
    limit: dto.limit ? Number.parseInt(dto.limit, 10) : 20,
    status: dto.status || null
  });
}

function toCreateChallengeTemplateCommand(dto) {
  return new CreateChallengeTemplateCommand({
    name: dto.name,
    description: dto.description,
    challengeType: dto.challenge_type || dto.challengeType,
    targetValue: dto.target_value || dto.targetValue,
    targetUnit: dto.target_unit || dto.targetUnit,
    tokensReward: dto.tokens_reward || dto.tokensReward,
    difficulty: dto.difficulty,
    rotationWeight: dto.rotation_weight || dto.rotationWeight || 1,
    isActive: dto.is_active ?? dto.isActive ?? true
  });
}

function toUpdateChallengeTemplateCommand(dto, idTemplate) {
  return new UpdateChallengeTemplateCommand({
    idTemplate,
    name: dto.name,
    description: dto.description,
    challengeType: dto.challenge_type || dto.challengeType,
    targetValue: dto.target_value || dto.targetValue,
    targetUnit: dto.target_unit || dto.targetUnit,
    tokensReward: dto.tokens_reward || dto.tokensReward,
    difficulty: dto.difficulty,
    rotationWeight: dto.rotation_weight || dto.rotationWeight,
    isActive: dto.is_active ?? dto.isActive
  });
}

function toGetChallengeTemplateByIdQuery(idTemplate) {
  return new GetChallengeTemplateByIdQuery({ idTemplate });
}

function toListChallengeTemplatesQuery(dto) {
  return new ListChallengeTemplatesQuery({
    page: dto.page ? Number.parseInt(dto.page, 10) : 1,
    limit: dto.limit ? Number.parseInt(dto.limit, 10) : 20,
    isActive: dto.is_active ?? dto.isActive ?? null
  });
}

function toUpdateChallengeSettingsCommand(dto) {
  return new UpdateChallengeSettingsCommand({
    enabledDays: dto.enabled_days || dto.enabledDays,
    autoGenerate: dto.auto_generate ?? dto.autoGenerate,
    autoGenerateTime: dto.auto_generate_time || dto.autoGenerateTime,
    defaultTokensReward: dto.default_tokens_reward || dto.defaultTokensReward
  });
}

function toGetChallengeSettingsQuery() {
  return new GetChallengeSettingsQuery();
}

// ==================== Entity → ResponseDTO ====================

function toDailyChallengeResponse(challenge) {
  if (!challenge) return null;

  return {
    id_challenge: challenge.id_challenge || challenge.idChallenge,
    challenge_date: challenge.challenge_date || challenge.challengeDate,
    title: challenge.title,
    description: challenge.description,
    challenge_type: challenge.challenge_type || challenge.challengeType,
    target_value: challenge.target_value || challenge.targetValue,
    target_unit: challenge.target_unit || challenge.targetUnit,
    tokens_reward: challenge.tokens_reward || challenge.tokensReward,
    difficulty: challenge.difficulty,
    is_active: challenge.is_active ?? challenge.isActive ?? true,
    id_template: challenge.id_template || challenge.idTemplate || null,
    created_at: challenge.created_at || challenge.createdAt,
    updated_at: challenge.updated_at || challenge.updatedAt
  };
}

function toUserChallengeProgressResponse(progress) {
  if (!progress) return null;

  return {
    id_user_challenge: progress.id_user_challenge || progress.idUserChallenge,
    id_user_profile: progress.id_user_profile || progress.idUserProfile,
    id_challenge: progress.id_challenge || progress.idChallenge,
    current_value: progress.current_value || progress.currentValue || 0,
    status: progress.status,
    completed_at: progress.completed_at || progress.completedAt || null,
    reward_claimed_at: progress.reward_claimed_at || progress.rewardClaimedAt || null,
    created_at: progress.created_at || progress.createdAt,
    updated_at: progress.updated_at || progress.updatedAt
  };
}

function toChallengeWithProgressResponse(challenge, progress) {
  return {
    challenge: toDailyChallengeResponse(challenge),
    progress: toUserChallengeProgressResponse(progress)
  };
}

function toChallengeTemplateResponse(template) {
  if (!template) return null;

  return {
    id_template: template.id_template || template.idTemplate,
    name: template.name,
    description: template.description,
    challenge_type: template.challenge_type || template.challengeType,
    target_value: template.target_value || template.targetValue,
    target_unit: template.target_unit || template.targetUnit,
    tokens_reward: template.tokens_reward || template.tokensReward,
    difficulty: template.difficulty,
    rotation_weight: template.rotation_weight || template.rotationWeight,
    is_active: template.is_active ?? template.isActive ?? true,
    created_at: template.created_at || template.createdAt,
    updated_at: template.updated_at || template.updatedAt
  };
}

function toChallengeSettingsResponse(settings) {
  if (!settings) return null;

  return {
    id_settings: settings.id_settings || settings.idSettings,
    enabled_days: settings.enabled_days || settings.enabledDays,
    auto_generate: settings.auto_generate ?? settings.autoGenerate ?? false,
    auto_generate_time: settings.auto_generate_time || settings.autoGenerateTime,
    default_tokens_reward: settings.default_tokens_reward || settings.defaultTokensReward,
    created_at: settings.created_at || settings.createdAt,
    updated_at: settings.updated_at || settings.updatedAt
  };
}

function toPaginatedChallengesResponse({ items, total, page, limit }) {
  return {
    items: items.map((challenge) => toDailyChallengeResponse(challenge)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

function toPaginatedUserChallengesResponse({ items, total, page, limit }) {
  return {
    items: items.map((uc) => toUserChallengeProgressResponse(uc)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

function toPaginatedTemplatesResponse({ items, total, page, limit }) {
  return {
    items: items.map((template) => toChallengeTemplateResponse(template)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = {
  // Request → Command/Query
  toCreateDailyChallengeCommand,
  toUpdateDailyChallengeCommand,
  toStartChallengeCommand,
  toUpdateChallengeProgressCommand,
  toClaimChallengeRewardCommand,
  toGetTodayChallengeQuery,
  toGetChallengeByIdQuery,
  toListChallengesQuery,
  toGetUserChallengeProgressQuery,
  toListUserChallengesQuery,
  toCreateChallengeTemplateCommand,
  toUpdateChallengeTemplateCommand,
  toGetChallengeTemplateByIdQuery,
  toListChallengeTemplatesQuery,
  toUpdateChallengeSettingsCommand,
  toGetChallengeSettingsQuery,

  // Entity → Response
  toDailyChallengeResponse,
  toUserChallengeProgressResponse,
  toChallengeWithProgressResponse,
  toChallengeTemplateResponse,
  toChallengeSettingsResponse,
  toPaginatedChallengesResponse,
  toPaginatedUserChallengesResponse,
  toPaginatedTemplatesResponse
};
