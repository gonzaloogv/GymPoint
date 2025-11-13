/**
 * Utilidades de tipos para trabajar con los DTOs generados del OpenAPI
 * Este archivo facilita el uso de los tipos generados en api.types.ts
 */

import { components, operations } from './generated/api.types';

// ============================================================================
// SCHEMAS (DTOs)
// ============================================================================

// Auth & Accounts
export type RegisterRequest = components['schemas']['RegisterRequest'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type GoogleLoginRequest = components['schemas']['GoogleLoginRequest'];
export type RefreshTokenRequest = components['schemas']['RefreshTokenRequest'];
export type AuthSuccessResponse = components['schemas']['AuthSuccessResponse'];

// Users & Profiles
export type UserProfileResponse = components['schemas']['UserProfileResponse'];
export type UpdateUserProfileRequest = components['schemas']['UpdateUserProfileRequest'];
export type UserPresenceResponse = components['schemas']['UserPresenceResponse'];

// Gyms
export type GymResponse = components['schemas']['GymResponse'];
export type CreateGymRequest = components['schemas']['CreateGymRequest'];
export type UpdateGymRequest = components['schemas']['UpdateGymRequest'];
export type PaginatedGymsResponse = components['schemas']['PaginatedGymsResponse'];

// Gym Amenities
export type GymAmenity = components['schemas']['GymAmenity'];
export type AssignAmenityRequest = components['schemas']['AssignAmenityRequest'];

// Gym Types
export type GymType = components['schemas']['GymType'];
export type AssignGymTypeRequest = components['schemas']['AssignGymTypeRequest'];

// Gym Schedules
export type GymScheduleResponse = components['schemas']['GymScheduleResponse'];
export type CreateGymScheduleRequest = components['schemas']['CreateGymScheduleRequest'];
export type UpdateGymScheduleRequest = components['schemas']['UpdateGymScheduleRequest'];

// Gym Special Schedules
export type GymSpecialScheduleResponse = components['schemas']['GymSpecialScheduleResponse'];
export type CreateGymSpecialScheduleRequest = components['schemas']['CreateGymSpecialScheduleRequest'];
export type UpdateGymSpecialScheduleRequest = components['schemas']['UpdateGymSpecialScheduleRequest'];

// Gym Reviews
export type GymReviewResponse = components['schemas']['GymReviewResponse'];
export type CreateGymReviewRequest = components['schemas']['CreateGymReviewRequest'];
export type UpdateGymReviewRequest = components['schemas']['UpdateGymReviewRequest'];
export type PaginatedGymReviewsResponse = components['schemas']['PaginatedGymReviewsResponse'];

// Gym Payments
export type GymPaymentResponse = components['schemas']['GymPaymentResponse'];
export type CreateGymPaymentRequest = components['schemas']['CreateGymPaymentRequest'];
export type UpdateGymPaymentRequest = components['schemas']['UpdateGymPaymentRequest'];
export type PaginatedGymPaymentsResponse = components['schemas']['PaginatedGymPaymentsResponse'];

// Rewards
export type RewardResponse = components['schemas']['RewardResponse'];
export type CreateRewardRequest = components['schemas']['CreateRewardRequest'];
export type UpdateRewardRequest = components['schemas']['UpdateRewardRequest'];

// Exercises
export type Exercise = components['schemas']['Exercise'];
export type CreateExerciseRequest = components['schemas']['CreateExerciseRequest'];
export type UpdateExerciseRequest = components['schemas']['UpdateExerciseRequest'];
export type PaginatedExercisesResponse = components['schemas']['PaginatedExercisesResponse'];

// Daily Challenges
export type DailyChallengeResponse = components['schemas']['DailyChallengeResponse'];
export type CreateDailyChallengeRequest = components['schemas']['CreateDailyChallengeRequest'];
export type UpdateDailyChallengeRequest = components['schemas']['UpdateDailyChallengeRequest'];

// Daily Challenge Templates
export type DailyChallengeTemplateResponse = components['schemas']['DailyChallengeTemplateResponse'];
export type CreateDailyChallengeTemplateRequest = components['schemas']['CreateDailyChallengeTemplateRequest'];
export type UpdateDailyChallengeTemplateRequest = components['schemas']['UpdateDailyChallengeTemplateRequest'];

// Streaks
export type StreakResponse = components['schemas']['StreakResponse'];

// Frequency
export type FrequencyResponse = components['schemas']['FrequencyResponse'];
export type UpdateFrequencyGoalRequest = components['schemas']['UpdateFrequencyGoalRequest'];

// Achievements
export type AchievementDefinitionResponse = components['schemas']['AchievementDefinitionResponse'];
export type CreateAchievementDefinitionRequest = components['schemas']['CreateAchievementDefinitionRequest'];
export type UpdateAchievementDefinitionRequest = components['schemas']['UpdateAchievementDefinitionRequest'];

// Assistance
export type AssistanceResponse = components['schemas']['AssistanceResponse'];
export type CreateAssistanceRequest = components['schemas']['CreateAssistanceRequest'];
export type UpdateAssistanceRequest = components['schemas']['UpdateAssistanceRequest'];

// Common
export type ErrorResponse = components['schemas']['Error'];

// ============================================================================
// OPERATIONS (Request/Response types completos)
// ============================================================================

// Auth
export type RegisterOperation = operations['registerAccount'];
export type LoginOperation = operations['loginWithPassword'];
export type GoogleLoginOperation = operations['loginWithGoogle'];
export type RefreshTokenOperation = operations['refreshAccessToken'];

// Gyms
export type ListGymsOperation = operations['listGyms'];
export type GetGymOperation = operations['getGymById'];
export type CreateGymOperation = operations['createGym'];
export type UpdateGymOperation = operations['updateGym'];
export type DeleteGymOperation = operations['deleteGym'];

// Gym Schedules
export type ListGymSchedulesOperation = operations['listGymSchedules'];
export type CreateGymScheduleOperation = operations['createGymSchedule'];
export type UpdateGymScheduleOperation = operations['updateGymSchedule'];
export type DeleteGymScheduleOperation = operations['deleteGymSchedule'];

// Gym Reviews
export type ListGymReviewsOperation = operations['listGymReviews'];
export type CreateGymReviewOperation = operations['createGymReview'];
export type UpdateGymReviewOperation = operations['updateGymReview'];
export type DeleteGymReviewOperation = operations['deleteGymReview'];

// Exercises
export type ListExercisesOperation = operations['listExercisesPaginated'];
export type GetExerciseOperation = operations['getExerciseById'];
export type CreateExerciseOperation = operations['createExercise'];
export type UpdateExerciseOperation = operations['updateExercise'];
export type DeleteExerciseOperation = operations['deleteExercise'];

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extrae el tipo de respuesta exitosa de una operación
 */
export type SuccessResponse<T> = T extends { responses: { 200: { content: { 'application/json': infer R } } } }
  ? R
  : T extends { responses: { 201: { content: { 'application/json': infer R } } } }
  ? R
  : never;

/**
 * Extrae el tipo de request body de una operación
 */
export type RequestBody<T> = T extends {
  requestBody: { content: { 'application/json': infer R } };
}
  ? R
  : never;

/**
 * Tipo genérico para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Parámetros comunes de paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}
