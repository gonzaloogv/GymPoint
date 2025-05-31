const userRoutineService = require('../services/user-routine-service');

const assignRoutineToUser = async (req, res) => {
  try {
    const id_user = req.user.id; // ✅ extraído del token
    const { id_routine, start_date } = req.body;

    const routine = await userRoutineService.assignRoutineToUser({
      id_user,
      id_routine,
      start_date
    });

    res.status(201).json(routine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getActiveRoutine = async (req, res) => {
  try {
    const id_user = req.user.id;
    const routine = await userRoutineService.getActiveRoutine(id_user);
    res.json(routine);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const endUserRoutine = async (req, res) => {
  try {
    const id_user = req.user.id;
    const routine = await userRoutineService.endUserRoutine(id_user);
    res.json(routine);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const getActiveRoutineWithExercises = async (req, res) => {
  try {
    const id_user = req.user.id;
    const routine = await userRoutineService.getActiveRoutineWithExercises(id_user);
    res.json(routine);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

module.exports = {
  assignRoutineToUser,
  getActiveRoutine,
  endUserRoutine,
  getActiveRoutineWithExercises
};
