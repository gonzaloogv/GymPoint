import {
  Routine,
  RoutineExercise,
  RoutineDay,
  CreateRoutineRequest,
  UpdateRoutineRequest,
  UserImportedRoutine,
  ImportTemplateResponse,
} from '../../domain/entities/Routine';
import {
  RoutineDTO,
  RoutineExerciseDTO,
  RoutineDayDTO,
  CreateRoutineRequestDTO,
  UpdateRoutineRequestDTO,
  UserImportedRoutineDTO,
  ImportTemplateResponseDTO,
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
 * Convierte RoutineDayDTO a RoutineDay entity
 */
export const routineDayDTOToEntity = (dto: RoutineDayDTO): RoutineDay => {
  return {
    id_routine_day: dto.id_routine_day,
    id_routine: dto.id_routine,
    day_number: dto.day_number,
    title: dto.title,
    description: dto.description,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    exercises: dto.exercises?.map(routineExerciseDTOToEntity),
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
    days: dto.days?.map(routineDayDTOToEntity),
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

/**
 * Convierte UserImportedRoutineDTO a UserImportedRoutine entity
 */
export const userImportedRoutineDTOToEntity = (dto: UserImportedRoutineDTO): UserImportedRoutine => {
  return {
    id_import: dto.id_import,
    id_user_profile: dto.id_user_profile,
    id_template_routine: dto.id_template_routine,
    id_user_routine: dto.id_user_routine,
    imported_at: dto.imported_at,
    templateRoutine: dto.templateRoutine ? routineDTOToEntity(dto.templateRoutine) : undefined,
    userRoutine: dto.userRoutine ? routineDTOToEntity(dto.userRoutine) : undefined,
  };
};

/**
 * Convierte ImportTemplateResponseDTO a ImportTemplateResponse entity
 */
export const importTemplateResponseDTOToEntity = (dto: ImportTemplateResponseDTO): ImportTemplateResponse => {
  return {
    id_routine_copy: dto.id_routine_copy,
    routine: routineDTOToEntity(dto.routine),
  };
};

export const routineMappers = {
  routineDTOToEntity,
  routineDTOsToEntities,
  routineExerciseDTOToEntity,
  routineDayDTOToEntity,
  createRoutineRequestToDTO,
  updateRoutineRequestToDTO,
  userImportedRoutineDTOToEntity,
  importTemplateResponseDTOToEntity,
};
