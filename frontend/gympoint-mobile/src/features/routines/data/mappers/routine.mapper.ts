import { Routine, Exercise, RoutineSession, SetLog } from '../../domain/entities';
import { RoutineDTO, ExerciseDTO, RoutineSessionDTO, SetLogDTO } from '../dto/RoutineDTO';

export const mapExerciseDTOToEntity = (dto: ExerciseDTO): Exercise => {
  return {
    id: dto.id,
    name: dto.name,
    sets: dto.sets,
    reps: dto.reps,
    rest: dto.rest,
    muscleGroups: dto.muscleGroups,
  };
};

export const mapRoutineDTOToEntity = (dto: RoutineDTO): Routine => {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    exercises: dto.exercises.map(mapExerciseDTOToEntity),
    estimatedDuration: dto.estimatedDuration,
    lastPerformed: dto.lastPerformed,
    nextScheduled: dto.nextScheduled,
    difficulty: dto.difficulty,
    muscleGroups: dto.muscleGroups,
  };
};

export const mapSetLogDTOToEntity = (dto: SetLogDTO): SetLog => {
  return {
    exerciseId: dto.exerciseId,
    setNumber: dto.setNumber,
    reps: dto.reps,
    weightKg: dto.weightKg,
    restTakenSec: dto.restTakenSec,
  };
};

export const mapRoutineSessionDTOToEntity = (dto: RoutineSessionDTO): RoutineSession => {
  return {
    id: dto.id,
    routineId: dto.routineId,
    date: dto.date,
    durationMin: dto.durationMin,
    completed: dto.completed,
    notes: dto.notes,
    logs: dto.logs.map(mapSetLogDTOToEntity),
  };
};

// Mappers inversos (Entity → DTO) para cuando se necesiten
export const mapRoutineSessionEntityToDTO = (session: RoutineSession): RoutineSessionDTO => {
  return {
    id: session.id,
    routineId: session.routineId,
    date: session.date,
    durationMin: session.durationMin,
    completed: session.completed,
    notes: session.notes,
    logs: session.logs.map((log) => ({
      exerciseId: log.exerciseId,
      setNumber: log.setNumber,
      reps: log.reps,
      weightKg: log.weightKg,
      restTakenSec: log.restTakenSec,
    })),
  };
};

