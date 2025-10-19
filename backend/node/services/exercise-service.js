const Exercise = require('../models/Exercise');

const ALLOWED_FIELDS = new Set([
  'exercise_name',
  'muscular_group',
  'description',
  'equipment_needed',
  'difficulty',
  'instructions',
  'video_url',
  'created_by'
]);

const sanitizePayload = (payload = {}) => {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([key, value]) => ALLOWED_FIELDS.has(key) && value !== undefined
    )
  );
};

const getAllExercises = async () => {
  return Exercise.findAll();
};

const getExerciseById = async (id) => {
  return Exercise.findByPk(id);
};

const createExercise = async (data) => {
  const sanitized = sanitizePayload(data);
  return Exercise.create(sanitized);
};

const updateExercise = async (id, data) => {
  const exercise = await Exercise.findByPk(id);
  if (!exercise) throw new Error('Exercise not found');

  const sanitized = sanitizePayload(data);
  await exercise.update(sanitized);
  return exercise.reload();
};

const deleteExercise = async (id) => {
  const exercise = await Exercise.findByPk(id);
  if (!exercise) throw new Error('Exercise not found');
  return exercise.destroy();
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
};
