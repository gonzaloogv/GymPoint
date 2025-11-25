import {
  WorkoutSession,
  WorkoutSet,
  StartWorkoutSessionRequest,
  RegisterWorkoutSetRequest,
  UpdateWorkoutSetRequest,
  CompleteWorkoutSessionRequest,
  WorkoutStats,
} from '../../domain/entities/WorkoutSession';
import {
  WorkoutSessionDTO,
  WorkoutSetDTO,
  StartWorkoutSessionRequestDTO,
  RegisterWorkoutSetRequestDTO,
  UpdateWorkoutSetRequestDTO,
  CompleteWorkoutSessionRequestDTO,
} from '../dto/WorkoutDTO';

/**
 * Workout Mappers
 * Convierten entre DTO (API) y Entity (Domain)
 */

/**
 * Convierte WorkoutSessionDTO a WorkoutSession entity
 */
export const workoutSessionDTOToEntity = (dto: WorkoutSessionDTO): WorkoutSession => {
  return {
    id_workout_session: dto.id_workout_session,
    id_user_profile: dto.id_user_profile,
    id_routine: dto.id_routine,
    id_routine_day: dto.id_routine_day,
    status: dto.status,
    started_at: dto.started_at,
    finished_at: dto.finished_at,
    duration_seconds: dto.duration_seconds,
    total_sets: dto.total_sets,
    total_reps: dto.total_reps,
    total_weight: typeof dto.total_weight === 'string' ? parseFloat(dto.total_weight) : dto.total_weight,
    notes: dto.notes,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    routine: dto.routine,
  };
};

/**
 * Convierte array de WorkoutSessionDTOs a array de WorkoutSession entities
 */
export const workoutSessionDTOsToEntities = (dtos: WorkoutSessionDTO[]): WorkoutSession[] => {
  return dtos.map(workoutSessionDTOToEntity);
};

/**
 * Convierte WorkoutSetDTO a WorkoutSet entity
 */
export const workoutSetDTOToEntity = (dto: WorkoutSetDTO): WorkoutSet => {
  return {
    id_workout_set: dto.id_workout_set,
    id_workout_session: dto.id_workout_session,
    id_exercise: dto.id_exercise,
    set_number: dto.set_number,
    weight: dto.weight,
    reps: dto.reps,
    rpe: dto.rpe,
    rest_seconds: dto.rest_seconds,
    is_warmup: dto.is_warmup,
    notes: dto.notes,
    created_at: dto.created_at,
    exercise: dto.exercise,
  };
};

/**
 * Convierte array de WorkoutSetDTOs a array de WorkoutSet entities
 */
export const workoutSetDTOsToEntities = (dtos: WorkoutSetDTO[]): WorkoutSet[] => {
  return dtos.map(workoutSetDTOToEntity);
};

/**
 * Convierte StartWorkoutSessionRequest a StartWorkoutSessionRequestDTO
 */
export const startWorkoutSessionRequestToDTO = (
  request: StartWorkoutSessionRequest
): StartWorkoutSessionRequestDTO => {
  return {
    id_routine: request.id_routine,
    id_routine_day: request.id_routine_day,
    started_at: request.started_at,
    notes: request.notes,
  };
};

/**
 * Convierte RegisterWorkoutSetRequest a RegisterWorkoutSetRequestDTO
 */
export const registerWorkoutSetRequestToDTO = (
  request: RegisterWorkoutSetRequest
): RegisterWorkoutSetRequestDTO => {
  return {
    id_exercise: request.id_exercise,
    weight: request.weight,
    reps: request.reps,
    rpe: request.rpe,
    rest_seconds: request.rest_seconds,
    is_warmup: request.is_warmup,
    notes: request.notes,
  };
};

/**
 * Convierte UpdateWorkoutSetRequest a UpdateWorkoutSetRequestDTO
 */
export const updateWorkoutSetRequestToDTO = (
  request: UpdateWorkoutSetRequest
): UpdateWorkoutSetRequestDTO => {
  return {
    weight: request.weight,
    reps: request.reps,
    rpe: request.rpe,
    rest_seconds: request.rest_seconds,
    notes: request.notes,
  };
};

/**
 * Convierte CompleteWorkoutSessionRequest a CompleteWorkoutSessionRequestDTO
 */
export const completeWorkoutSessionRequestToDTO = (
  request: CompleteWorkoutSessionRequest
): CompleteWorkoutSessionRequestDTO => {
  return {
    ended_at: request.ended_at,
    notes: request.notes,
  };
};

export const workoutMappers = {
  workoutSessionDTOToEntity,
  workoutSessionDTOsToEntities,
  workoutSetDTOToEntity,
  workoutSetDTOsToEntities,
  startWorkoutSessionRequestToDTO,
  registerWorkoutSetRequestToDTO,
  updateWorkoutSetRequestToDTO,
  completeWorkoutSessionRequestToDTO,
};
