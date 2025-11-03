import {
  UserRoutine,
  ActiveUserRoutineWithDetails,
  ActiveRoutineExercise,
  AssignRoutineRequest,
  UserRoutineCounts,
} from '../../domain/entities/UserRoutine';
import {
  UserRoutineDTO,
  ActiveUserRoutineWithDetailsDTO,
  ActiveRoutineExerciseDTO,
  AssignRoutineRequestDTO,
  UserRoutineCountsDTO,
} from '../dto/UserRoutineDTO';
import { routineDTOToEntity } from './routine.mapper';

/**
 * UserRoutine Mappers
 * Convierten entre DTO (API) y Entity (Domain)
 */

/**
 * Convierte ActiveRoutineExerciseDTO a ActiveRoutineExercise entity
 */
export const activeRoutineExerciseDTOToEntity = (
  dto: ActiveRoutineExerciseDTO
): ActiveRoutineExercise => {
  return {
    id_exercise: dto.id_exercise,
    exercise_name: dto.exercise_name,
    muscular_group: dto.muscular_group,
    difficulty_level: dto.difficulty_level || dto.difficulty,
    description: dto.description,
    equipment_needed: dto.equipment_needed,
    instructions: dto.instructions,
    video_url: dto.video_url,
    // Mapear datos de RoutineExercise
    series: dto.RoutineExercise?.sets ?? null,
    reps: dto.RoutineExercise?.reps ?? null,
    order: dto.RoutineExercise?.exercise_order ?? null,
  };
};

/**
 * Convierte ActiveUserRoutineWithDetailsDTO a ActiveUserRoutineWithDetails entity
 */
export const activeUserRoutineDTOToEntity = (
  dto: ActiveUserRoutineWithDetailsDTO
): ActiveUserRoutineWithDetails => {
  // Usar Exercises (mayúscula) primero, luego exercises (minúscula) como fallback
  const exercises = dto.Exercises || dto.exercises;

  return {
    id_routine: dto.id_routine,
    routine_name: dto.routine_name,
    description: dto.description,
    exercises: exercises?.map(activeRoutineExerciseDTOToEntity),
  };
};

/**
 * Convierte UserRoutineDTO a UserRoutine entity
 */
export const userRoutineDTOToEntity = (dto: UserRoutineDTO): UserRoutine => {
  return {
    id_user_routine: dto.id_user_routine,
    id_user: dto.id_user,
    id_routine: dto.id_routine,
    start_date: dto.start_date,
    finish_date: dto.finish_date,
    active: dto.active,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    routine: dto.routine ? routineDTOToEntity(dto.routine) : undefined,
  };
};

/**
 * Convierte array de UserRoutineDTOs a array de UserRoutine entities
 */
export const userRoutineDTOsToEntities = (dtos: UserRoutineDTO[]): UserRoutine[] => {
  return dtos.map(userRoutineDTOToEntity);
};

/**
 * Convierte UserRoutineCountsDTO a UserRoutineCounts entity
 */
export const userRoutineCountsDTOToEntity = (
  dto: UserRoutineCountsDTO
): UserRoutineCounts => {
  return {
    total_owned: dto.total_owned,
    imported_count: dto.imported_count,
    created_count: dto.created_count,
  };
};

/**
 * Convierte AssignRoutineRequest a AssignRoutineRequestDTO
 */
export const assignRoutineRequestToDTO = (
  request: AssignRoutineRequest
): AssignRoutineRequestDTO => {
  return {
    id_routine: request.id_routine,
    start_date: request.start_date,
  };
};

export const userRoutineMappers = {
  userRoutineDTOToEntity,
  userRoutineDTOsToEntities,
  activeUserRoutineDTOToEntity,
  activeRoutineExerciseDTOToEntity,
  userRoutineCountsDTOToEntity,
  assignRoutineRequestToDTO,
};
