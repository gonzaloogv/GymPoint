/**
 * Mappers consolidados para Reviews, Rewards, Exercises, Achievements y DailyChallenges
 * Convierte entre DTOs del OpenAPI y entidades del dominio
 */

import {
  Review,
  Reward,
  CreateRewardDTO as DomainCreateRewardDTO,
  UpdateRewardDTO as DomainUpdateRewardDTO,
  DailyChallenge,
  CreateDailyChallengeDTO as DomainCreateDailyChallengeDTO,
  UpdateDailyChallengeDTO as DomainUpdateDailyChallengeDTO,
  DailyChallengeTemplate,
  CreateDailyChallengeTemplateDTO as DomainCreateDailyChallengeTemplateDTO,
  UpdateDailyChallengeTemplateDTO as DomainUpdateDailyChallengeTemplateDTO,
  AchievementDefinition,
  AchievementDefinitionInput,
  UpdateAchievementDefinitionInput,
} from '@/domain/entities';

import {
  GymReviewResponse,
  RewardResponse,
  CreateRewardRequest,
  UpdateRewardRequest,
  Exercise,
  CreateExerciseRequest,
  UpdateExerciseRequest,
  DailyChallengeResponse,
  CreateDailyChallengeRequest,
  UpdateDailyChallengeRequest,
  DailyChallengeTemplateResponse,
  CreateDailyChallengeTemplateRequest,
  UpdateDailyChallengeTemplateRequest,
  AchievementDefinitionResponse,
  CreateAchievementDefinitionRequest,
  UpdateAchievementDefinitionRequest,
} from '../dto/types';

// ============================================================================
// REVIEW MAPPERS
// ============================================================================

/**
 * Convierte GymReviewResponse (DTO del API) a Review (entidad del dominio)
 */
export function mapGymReviewResponseToReview(dto: GymReviewResponse): Review {
  return {
    id_review: dto.id_review,
    id_user_profile: dto.id_user_profile,
    id_gym: dto.id_gym,
    rating: dto.rating,
    title: dto.title || null,
    comment: dto.comment || null,
    cleanliness_rating: dto.cleanliness_rating || null,
    equipment_rating: dto.equipment_rating || null,
    staff_rating: dto.staff_rating || null,
    value_rating: dto.value_rating || null,
    helpful_count: dto.helpful_count || 0,
    reported: false, // No hay campo reported en OpenAPI
    is_approved: true, // Asumir aprobado si está en la respuesta
    review_date: dto.created_at, // Usar created_at como review_date
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

// ============================================================================
// REWARD MAPPERS
// ============================================================================

/**
 * Convierte RewardResponse (DTO del API) a Reward (entidad del dominio)
 */
export function mapRewardResponseToReward(dto: RewardResponse): Reward {
  return {
    id_reward: dto.id_reward,
    name: dto.name,
    description: dto.description,
    reward_type: dto.reward_type as any,
    cost_tokens: dto.token_cost,
    available: dto.is_active ?? true,
    stock: dto.stock || 0,
    start_date: dto.valid_from || null,
    finish_date: dto.valid_until || null,
    image_url: dto.image_url || null,
    terms: dto.terms || null,
    creation_date: dto.created_at,
    deleted_at: dto.deleted_at || null,
  };
}

/**
 * Convierte CreateRewardDTO (del dominio) a CreateRewardRequest (DTO del API)
 */
export function mapCreateRewardDTOToRequest(domainDTO: DomainCreateRewardDTO): CreateRewardRequest {
  return {
    name: domainDTO.name,
    description: domainDTO.description,
    reward_type: domainDTO.reward_type as any,
    token_cost: domainDTO.cost_tokens,
    stock: domainDTO.stock || 0,
    valid_from: domainDTO.start_date,
    valid_until: domainDTO.finish_date,
    is_active: domainDTO.available ?? true,
    image_url: domainDTO.image_url || undefined,
    terms: domainDTO.terms || undefined,
  };
}

/**
 * Convierte UpdateRewardDTO (del dominio) a UpdateRewardRequest (DTO del API)
 */
export function mapUpdateRewardDTOToRequest(domainDTO: DomainUpdateRewardDTO): UpdateRewardRequest {
  const request: UpdateRewardRequest = {};

  if (domainDTO.name !== undefined) request.name = domainDTO.name;
  if (domainDTO.description !== undefined) request.description = domainDTO.description;
  if (domainDTO.reward_type !== undefined) request.reward_type = domainDTO.reward_type as any;
  if (domainDTO.cost_tokens !== undefined) request.token_cost = domainDTO.cost_tokens;
  if (domainDTO.stock !== undefined) request.stock = domainDTO.stock;
  if (domainDTO.start_date !== undefined) request.valid_from = domainDTO.start_date;
  if (domainDTO.finish_date !== undefined) request.valid_until = domainDTO.finish_date;
  if (domainDTO.available !== undefined) request.is_active = domainDTO.available;
  if (domainDTO.image_url !== undefined) request.image_url = domainDTO.image_url || undefined;
  if (domainDTO.terms !== undefined) request.terms = domainDTO.terms || undefined;

  return request;
}

// ============================================================================
// EXERCISE MAPPERS
// ============================================================================

/**
 * Convierte Exercise (DTO del OpenAPI) a Exercise (entidad del dominio)
 * El dominio usa null para campos opcionales, pero OpenAPI genera undefined
 */
export function mapExerciseResponseToExercise(dto: Exercise): any {
  return {
    id_exercise: dto.id_exercise,
    exercise_name: dto.exercise_name,
    description: dto.description ?? null,
    muscular_group: dto.muscular_group ?? null,
    equipment_needed: dto.equipment_needed ?? null,
    difficulty: dto.difficulty ?? null,
    instructions: dto.instructions ?? null,
    video_url: dto.video_url ?? null,
    created_by: dto.created_by ?? null,
  };
}

export function mapCreateExerciseToRequest(data: any): CreateExerciseRequest {
  return {
    exercise_name: data.name || data.exercise_name || '',
    description: data.description,
    muscular_group: data.muscle_group || data.muscular_group,
    equipment_needed: data.equipment || data.equipment_needed,
    difficulty: data.difficulty,
    instructions: data.instructions,
    video_url: data.video_url,
  };
}

export function mapUpdateExerciseToRequest(data: any): UpdateExerciseRequest {
  const request: UpdateExerciseRequest = {};

  const exerciseName = data.name || data.exercise_name;
  if (exerciseName !== undefined) request.exercise_name = exerciseName;

  if (data.description !== undefined) request.description = data.description;

  const muscularGroup = data.muscle_group || data.muscular_group;
  if (muscularGroup !== undefined) request.muscular_group = muscularGroup;

  const equipmentNeeded = data.equipment || data.equipment_needed;
  if (equipmentNeeded !== undefined) request.equipment_needed = equipmentNeeded;

  if (data.difficulty !== undefined) request.difficulty = data.difficulty;
  if (data.instructions !== undefined) request.instructions = data.instructions;
  if (data.video_url !== undefined) request.video_url = data.video_url;

  return request;
}

// ============================================================================
// DAILY CHALLENGE MAPPERS
// ============================================================================

export function mapDailyChallengeResponseToDailyChallenge(
  dto: DailyChallengeResponse
): DailyChallenge {
  return {
    id_challenge: dto.id_challenge,
    challenge_date: dto.challenge_date,
    title: dto.title,
    description: dto.description || null,
    challenge_type: dto.challenge_type as any,
    target_value: dto.target_value,
    target_unit: dto.target_unit || null,
    tokens_reward: dto.tokens_reward,
    difficulty: dto.difficulty as any,
    is_active: dto.is_active,
    id_template: dto.id_template ?? null,
    auto_generated: dto.auto_generated ?? false,
    created_by: dto.created_by ?? null,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapCreateDailyChallengeDTOToRequest(
  domainDTO: DomainCreateDailyChallengeDTO
): CreateDailyChallengeRequest {
  return {
    challenge_date: domainDTO.challenge_date,
    title: domainDTO.title,
    description: domainDTO.description,
    challenge_type: domainDTO.challenge_type as any,
    target_value: domainDTO.target_value,
    target_unit: domainDTO.target_unit || '',
    tokens_reward: domainDTO.tokens_reward ?? 0,
    difficulty: domainDTO.difficulty as any,
    is_active: domainDTO.is_active ?? true,
    id_template: domainDTO.id_template ?? undefined,
    auto_generated: domainDTO.auto_generated ?? false,
  };
}

export function mapUpdateDailyChallengeDTOToRequest(
  domainDTO: DomainUpdateDailyChallengeDTO
): UpdateDailyChallengeRequest {
  const request: UpdateDailyChallengeRequest = {};

  if (domainDTO.challenge_date !== undefined) request.challenge_date = domainDTO.challenge_date;
  if (domainDTO.title !== undefined) request.title = domainDTO.title;
  if (domainDTO.description !== undefined) request.description = domainDTO.description;
  if (domainDTO.challenge_type !== undefined) request.challenge_type = domainDTO.challenge_type as any;
  if (domainDTO.target_value !== undefined) request.target_value = domainDTO.target_value;
  if (domainDTO.target_unit !== undefined) request.target_unit = domainDTO.target_unit;
  if (domainDTO.tokens_reward !== undefined) request.tokens_reward = domainDTO.tokens_reward;
  if (domainDTO.difficulty !== undefined) request.difficulty = domainDTO.difficulty as any;
  if (domainDTO.is_active !== undefined) request.is_active = domainDTO.is_active;
  if (domainDTO.id_template !== undefined) request.id_template = domainDTO.id_template ?? undefined;
  if (domainDTO.auto_generated !== undefined) request.auto_generated = domainDTO.auto_generated;

  return request;
}

// ============================================================================
// DAILY CHALLENGE TEMPLATE MAPPERS
// ============================================================================

export function mapDailyChallengeTemplateResponseToTemplate(
  dto: DailyChallengeTemplateResponse
): DailyChallengeTemplate {
  return {
    id_template: dto.id_template,
    title: dto.title,
    description: dto.description || null,
    challenge_type: dto.challenge_type as any,
    target_value: dto.target_value,
    target_unit: dto.target_unit || null,
    tokens_reward: dto.tokens_reward,
    difficulty: dto.difficulty as any,
    rotation_weight: dto.rotation_weight ?? 1,
    is_active: dto.is_active,
    created_by: dto.created_by ?? null,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapCreateDailyChallengeTemplateDTOToRequest(
  domainDTO: DomainCreateDailyChallengeTemplateDTO
): CreateDailyChallengeTemplateRequest {
  return {
    title: domainDTO.title,
    description: domainDTO.description,
    challenge_type: domainDTO.challenge_type as any,
    target_value: domainDTO.target_value,
    target_unit: domainDTO.target_unit || '',
    tokens_reward: domainDTO.tokens_reward ?? 0,
    difficulty: domainDTO.difficulty as any,
    rotation_weight: domainDTO.rotation_weight ?? 1,
    is_active: domainDTO.is_active ?? true,
  };
}

export function mapUpdateDailyChallengeTemplateDTOToRequest(
  domainDTO: DomainUpdateDailyChallengeTemplateDTO
): UpdateDailyChallengeTemplateRequest {
  const request: UpdateDailyChallengeTemplateRequest = {};

  if (domainDTO.title !== undefined) request.title = domainDTO.title;
  if (domainDTO.description !== undefined) request.description = domainDTO.description;
  if (domainDTO.challenge_type !== undefined) request.challenge_type = domainDTO.challenge_type as any;
  if (domainDTO.target_value !== undefined) request.target_value = domainDTO.target_value;
  if (domainDTO.target_unit !== undefined) request.target_unit = domainDTO.target_unit;
  if (domainDTO.tokens_reward !== undefined) request.tokens_reward = domainDTO.tokens_reward;
  if (domainDTO.difficulty !== undefined) request.difficulty = domainDTO.difficulty as any;
  if (domainDTO.rotation_weight !== undefined) request.rotation_weight = domainDTO.rotation_weight;
  if (domainDTO.is_active !== undefined) request.is_active = domainDTO.is_active;

  return request;
}

// ============================================================================
// ACHIEVEMENT MAPPERS
// ============================================================================

export function mapAchievementDefinitionResponseToAchievementDefinition(
  dto: AchievementDefinitionResponse
): AchievementDefinition {
  return {
    id_achievement_definition: dto.id_achievement_definition,
    code: dto.code,
    name: dto.name,
    description: dto.description ?? null,
    category: dto.category as any,
    metric_type: dto.metric_type as any,
    target_value: dto.target_value,
    metadata: (dto.metadata || null) as any,
    icon_url: dto.icon_url ?? null,
    is_active: dto.is_active,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  };
}

export function mapCreateAchievementDefinitionToRequest(
  domainInput: AchievementDefinitionInput
): CreateAchievementDefinitionRequest {
  return {
    code: domainInput.code,
    name: domainInput.name,
    description: domainInput.description ?? undefined,
    category: domainInput.category as any,
    metric_type: domainInput.metric_type as any,
    target_value: domainInput.target_value,
    metadata: (domainInput.metadata || undefined) as any,
    icon_url: domainInput.icon_url ?? undefined,
    is_active: domainInput.is_active ?? true,
  };
}

export function mapUpdateAchievementDefinitionToRequest(
  domainInput: UpdateAchievementDefinitionInput
): UpdateAchievementDefinitionRequest {
  const request: UpdateAchievementDefinitionRequest = {};

  if (domainInput.code !== undefined) request.code = domainInput.code;
  if (domainInput.name !== undefined) request.name = domainInput.name;
  if (domainInput.description !== undefined) request.description = domainInput.description ?? undefined;
  if (domainInput.category !== undefined) request.category = domainInput.category as any;
  if (domainInput.metric_type !== undefined) request.metric_type = domainInput.metric_type as any;
  if (domainInput.target_value !== undefined) request.target_value = domainInput.target_value;
  if (domainInput.metadata !== undefined) request.metadata = (domainInput.metadata || undefined) as any;
  if (domainInput.icon_url !== undefined) request.icon_url = domainInput.icon_url ?? undefined;
  if (domainInput.is_active !== undefined) request.is_active = domainInput.is_active;

  return request;
}
