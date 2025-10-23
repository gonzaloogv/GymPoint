/**
 * Routine DB Mapper
 * Transforma instancias de Sequelize a POJOs (Routine, RoutineDay, RoutineExercise)
 */

const { toPlain } = require('./utils');

function toRoutine(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const result = {
    id_routine: plain.id_routine,
    routine_name: plain.routine_name,
    description: plain.description || null,
    created_by: plain.created_by,
    is_template: plain.is_template || false,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };

  // Include creator relation if present
  if (plain.creator) {
    result.creator = {
      id_user_profile: plain.creator.id_user_profile,
      name: plain.creator.name,
      lastname: plain.creator.lastname
    };
  }

  // Include days relation if present
  if (plain.days && Array.isArray(plain.days)) {
    result.days = toRoutineDays(plain.days);
  }

  // Include exercises relation if present (through RoutineExercise)
  if (plain.exercises && Array.isArray(plain.exercises)) {
    result.exercises = plain.exercises.map(ex => ({
      id_exercise: ex.id_exercise,
      exercise_name: ex.exercise_name,
      category: ex.category || null,
      RoutineExercise: ex.RoutineExercise ? {
        series: ex.RoutineExercise.series,
        reps: ex.RoutineExercise.reps,
        order: ex.RoutineExercise.order,
        id_routine_day: ex.RoutineExercise.id_routine_day || null
      } : null
    }));
  }

  return result;
}

function toRoutines(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toRoutine);
}

function toRoutineDay(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const result = {
    id_routine_day: plain.id_routine_day,
    id_routine: plain.id_routine,
    day_number: plain.day_number,
    title: plain.title || null,
    description: plain.description || null,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };

  // Include routineExercises relation if present
  if (plain.routineExercises && Array.isArray(plain.routineExercises)) {
    result.routineExercises = plain.routineExercises.map(re => ({
      id_routine: re.id_routine,
      id_exercise: re.id_exercise,
      id_routine_day: re.id_routine_day,
      series: re.series,
      reps: re.reps,
      order: re.order,
      exercise: re.exercise ? {
        id_exercise: re.exercise.id_exercise,
        exercise_name: re.exercise.exercise_name,
        category: re.exercise.category || null
      } : null
    }));
  }

  return result;
}

function toRoutineDays(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toRoutineDay);
}

function toRoutineExercise(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_routine: plain.id_routine,
    id_exercise: plain.id_exercise,
    id_routine_day: plain.id_routine_day || null,
    series: plain.series,
    reps: plain.reps,
    order: plain.order,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };
}

function toRoutineExercises(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toRoutineExercise);
}

module.exports = {
  toRoutine,
  toRoutines,
  toRoutineDay,
  toRoutineDays,
  toRoutineExercise,
  toRoutineExercises
};
