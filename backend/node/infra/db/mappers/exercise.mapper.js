/**
 * Exercise DB Mapper
 * Transforma instancias de Sequelize a POJOs
 */

const { toPlain } = require('./utils');

function toExercise(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_exercise: plain.id_exercise,
    exercise_name: plain.exercise_name,
    muscular_group: plain.muscular_group || null,
    description: plain.description || null,
    equipment_needed: plain.equipment_needed || null,
    difficulty: plain.difficulty || null,
    instructions: plain.instructions || null,
    video_url: plain.video_url || null,
    created_by: plain.created_by || null,
    created_at: plain.created_at,
    updated_at: plain.updated_at
  };
}

function toExercises(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toExercise);
}

module.exports = {
  toExercise,
  toExercises
};
