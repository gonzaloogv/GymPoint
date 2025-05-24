const userRoutineService = require('../services/user-routine-service');

const assignRoutineToUser = async (req, res) => {
  try {
    const routine = await userRoutineService.assignRoutineToUser(req.body);
    res.status(201).json(routine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getActiveRoutine = async (req, res) => {
  try {
    const routine = await userRoutineService.getActiveRoutine(req.params.id_user);
    res.json(routine);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const endUserRoutine = async (req, res) => {
  try {
    const routine = await userRoutineService.endUserRoutine(req.params.id_user);
    res.json(routine);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const getActiveRoutineWithExercises = async (req, res) => {
  try {
    const routine = await userRoutineService.getActiveRoutineWithExercises(req.params.id_user);
    res.json(routine);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const obtenerEstadisticaPeso = async (req, res) => {
  try {
    const datos = await progressService.obtenerEstadisticaPeso(req.params.id_user);
    res.json(datos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  assignRoutineToUser,
  getActiveRoutine,
  endUserRoutine,
  getActiveRoutineWithExercises,
  obtenerEstadisticaPeso
};
