const Exercise = require('../models/Exercise');

const getAllExercises = async () => {
  return await Exercise.findAll();
};

const getExerciseById = async (id) => {
  return await Exercise.findByPk(id);
};

const createExercise = async (data) => {
  return await Exercise.create(data);
};

const updateExercise = async (id, data) => {
  const exercise = await Exercise.findByPk(id);
  if (!exercise) {
    throw new Error('Exercise not found');
  }
  return await exercise.update(data);
};

const deleteExercise = async (id) => {
  const exercise = await Exercise.findByPk(id);
  if (!exercise) {
    throw new Error('Exercise not found');
  }
  return await exercise.destroy();
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
