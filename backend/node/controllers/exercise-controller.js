const exerciseService = require('../services/exercise-service');

const getAllExercises = async (req, res) => {
  const exercises = await exerciseService.getAllExercises();
  res.json(exercises);
};

const getExerciseById = async (req, res) => {
  const exercise = await exerciseService.getExerciseById(req.params.id);
  if (!exercise) {
    return res.status(404).json({ error: 'Ejercicio no encontrado' });
  }
  res.json(exercise);
};

const createExercise = async (req, res) => {
  const exercise = await exerciseService.createExercise(req.body);
  res.status(201).json(exercise);
};

const updateExercise = async (req, res) => {
  try {
    const exercise = await exerciseService.updateExercise(req.params.id, req.body);
    res.json(exercise);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const deleteExercise = async (req, res) => {
  try {
    await exerciseService.deleteExercise(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
