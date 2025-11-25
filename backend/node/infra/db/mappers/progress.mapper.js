/**
 * Progress DB Mapper
 * Transforma instancias de Sequelize a POJOs
 */

const { toPlain } = require('./utils');

function toProgress(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_progress: plain.id_progress,
    id_user_profile: plain.id_user_profile,
    date: plain.date,
    total_weight_lifted: plain.total_weight_lifted,
    total_reps: plain.total_reps,
    total_sets: plain.total_sets,
    notes: plain.notes,
    created_at: plain.created_at,
    updated_at: plain.updated_at,
    // Relations
    userProfile: plain.userProfile ? {
      id_user_profile: plain.userProfile.id_user_profile,
      name: plain.userProfile.name,
      lastname: plain.userProfile.lastname
    } : undefined,
    exercises: plain.exercises ? plain.exercises.map(ex => ({
      id_exercise: ex.id_exercise,
      exercise_name: ex.exercise_name,
      muscular_group: ex.muscular_group,
      ProgressExercise: ex.ProgressExercise ? {
        used_weight: ex.ProgressExercise.used_weight,
        reps: ex.ProgressExercise.reps,
        sets: ex.ProgressExercise.sets
      } : undefined
    })) : undefined
  };
}

function toProgressList(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toProgress).filter(Boolean);
}

function toProgressExercise(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_progress_exercise: plain.id_progress_exercise,
    id_progress: plain.id_progress,
    id_exercise: plain.id_exercise,
    used_weight: plain.used_weight,
    reps: plain.reps,
    sets: plain.sets,
    // Relations
    exercise: plain.exercise ? {
      id_exercise: plain.exercise.id_exercise,
      exercise_name: plain.exercise.exercise_name,
      muscular_group: plain.exercise.muscular_group
    } : undefined
  };
}

function toProgressExerciseList(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toProgressExercise).filter(Boolean);
}

module.exports = {
  toProgress,
  toProgressList,
  toProgressExercise,
  toProgressExerciseList
};
