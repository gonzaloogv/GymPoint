/**
 * Adapter utilities for converting between legacy Exercise and RoutineExercise
 * Used during migration from mock data to backend entities
 */

import { Exercise } from '../entities/Exercise';
import { RoutineExercise } from '../entities/Routine';

/**
 * Converts legacy Exercise (mock) to RoutineExercise (backend)
 * @deprecated This is temporary during migration
 */
export function legacyExerciseToRoutineExercise(
  exercise: Exercise
): RoutineExercise {
  return {
    id_exercise: parseInt(exercise.id, 10) || 0,
    exercise_name: exercise.name,
    series: typeof exercise.sets === 'number' ? exercise.sets : parseInt(exercise.sets, 10),
    reps: exercise.reps,
    muscular_group: exercise.muscleGroups?.[0] || 'General',
    description: null,
    order: 0, // Will be set based on index
    difficulty_level: undefined,
  };
}

/**
 * Converts RoutineExercise (backend) to legacy Exercise (mock)
 * @deprecated This is temporary during migration
 */
export function routineExerciseToLegacyExercise(
  routineExercise: RoutineExercise
): Exercise {
  return {
    id: routineExercise.id_exercise.toString(),
    name: routineExercise.exercise_name,
    sets: routineExercise.series ?? 3,
    reps: routineExercise.reps ?? '0',
    rest: 60,
    muscleGroups: routineExercise.muscular_group ? [routineExercise.muscular_group] : ['General'],
  };
}
