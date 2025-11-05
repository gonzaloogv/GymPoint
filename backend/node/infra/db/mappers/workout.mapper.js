/**
 * Workout DB Mapper
 * Transforma instancias de Sequelize a POJOs (WorkoutSession, WorkoutSet)
 */

const { toPlain } = require('./utils');

function toWorkoutSession(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const result = {
    id_workout_session: plain.id_workout_session,
    id_user_profile: plain.id_user_profile,
    id_routine: plain.id_routine || null,
    id_routine_day: plain.id_routine_day || null,
    status: plain.status, // 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    started_at: plain.started_at,
    ended_at: plain.ended_at || null,
    total_sets: plain.total_sets || 0,
    total_reps: plain.total_reps || 0,
    total_weight: plain.total_weight || 0,
    notes: plain.notes || null,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };

  // Include routine relation if present
  if (plain.routine) {
    result.routine = {
      id_routine: plain.routine.id_routine,
      routine_name: plain.routine.routine_name
    };
  }

  // Include routine day relation if present
  if (plain.routineDay) {
    result.routineDay = {
      id_routine_day: plain.routineDay.id_routine_day,
      day_number: plain.routineDay.day_number,
      day_name: plain.routineDay.day_name || null
    };
  }

  // Include sets relation if present
  if (plain.sets && Array.isArray(plain.sets)) {
    result.sets = toWorkoutSets(plain.sets);
  }

  return result;
}

function toWorkoutSessions(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toWorkoutSession);
}

function toWorkoutSet(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const result = {
    id_workout_set: plain.id_workout_set,
    id_workout_session: plain.id_workout_session,
    id_exercise: plain.id_exercise,
    set_number: plain.set_number,
    weight: plain.weight || null,
    reps: plain.reps || null,
    rpe: plain.rpe || null,
    rest_seconds: plain.rest_seconds || null,
    is_warmup: plain.is_warmup || false,
    notes: plain.notes || null,
    performed_at: plain.performed_at,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };

  // Include exercise relation if present
  if (plain.exercise) {
    result.exercise = {
      id_exercise: plain.exercise.id_exercise,
      exercise_name: plain.exercise.exercise_name,
      muscular_group: plain.exercise.muscular_group || null
    };
  }

  return result;
}

function toWorkoutSets(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toWorkoutSet);
}

module.exports = {
  toWorkoutSession,
  toWorkoutSessions,
  toWorkoutSet,
  toWorkoutSets
};
