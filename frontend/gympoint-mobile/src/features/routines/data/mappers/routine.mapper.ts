import { Routine, RoutineExercise, CreateRoutineRequest, UpdateRoutineRequest } from '../../domain/entities/Routine';
import {
  RoutineDTO,
  RoutineExerciseDTO,
  CreateRoutineRequestDTO,
  UpdateRoutineRequestDTO,
} from '../dto/RoutineDTO';

/**
 * Routine Mappers
 * Convierten entre DTO (API) y Entity (Domain)
 */

/**
 * Convierte RoutineExerciseDTO a RoutineExercise entity
 */
export const routineExerciseDTOToEntity = (dto: RoutineExerciseDTO): RoutineExercise => {
  return {
    id_exercise: dto.id_exercise,
    exercise_name: dto.exercise_name,
    muscular_group: dto.muscular_group,
    difficulty_level: dto.difficulty_level,
    description: dto.description,
    series: dto.series,
    reps: dto.reps,
    order: dto.order,
  };
};

/**
 * Convierte RoutineDTO a Routine entity
 */
export const routineDTOToEntity = (dto: RoutineDTO): Routine => {
  return {
    id_routine: dto.id_routine,
    routine_name: dto.routine_name,
    description: dto.description,
    created_by: dto.created_by,
    is_template: dto.is_template,
    recommended_for: dto.recommended_for,
    template_order: dto.template_order,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    exercises: dto.exercises?.map(routineExerciseDTOToEntity),
  };
};

/**
 * Convierte array de RoutineDTOs a array de Routine entities
 */
export const routineDTOsToEntities = (dtos: RoutineDTO[]): Routine[] => {
  return dtos.map(routineDTOToEntity);
};

/**
 * Convierte CreateRoutineRequest a CreateRoutineRequestDTO
 */
export const createRoutineRequestToDTO = (request: CreateRoutineRequest): CreateRoutineRequestDTO => {
  return {
    routine_name: request.routine_name,
    description: request.description,
    exercises: request.exercises.map(ex => ({
      id_exercise: ex.id_exercise,
      series: ex.series,
      reps: ex.reps,
      order: ex.order,
      day_number: ex.day_number,
    })),
    days: request.days?.map(day => ({
      day_number: day.day_number,
      title: day.title,
      description: day.description,
    })),
  };
};

/**
 * Convierte UpdateRoutineRequest a UpdateRoutineRequestDTO
 */
export const updateRoutineRequestToDTO = (request: UpdateRoutineRequest): UpdateRoutineRequestDTO => {
  return {
    routine_name: request.routine_name,
    description: request.description,
    exercises: request.exercises?.map(ex => ({
      id_exercise: ex.id_exercise,
      series: ex.series,
      reps: ex.reps,
      order: ex.order,
      day_number: ex.day_number,
    })),
  };
};

export const routineMappers = {
  routineDTOToEntity,
  routineDTOsToEntities,
  routineExerciseDTOToEntity,
  createRoutineRequestToDTO,
  updateRoutineRequestToDTO,
};
