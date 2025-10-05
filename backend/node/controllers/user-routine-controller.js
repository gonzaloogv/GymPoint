const userRoutineService = require('../services/user-routine-service');

const assignRoutineToUser = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile; // extraído del token
    const { id_routine, start_date } = req.body;

    const routine = await userRoutineService.assignRoutineToUser({
      id_user,
      id_routine,
      start_date
    });

    res.status(201).json({
      message: 'Rutina asignada con éxito',
      data: routine
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'ASSIGN_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

const getActiveRoutine = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const routine = await userRoutineService.getActiveRoutine(id_user);
    res.json({
      message: 'Rutina activa obtenida con éxito',
      data: routine
    });
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'GET_ACTIVE_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

const endUserRoutine = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const routine = await userRoutineService.endUserRoutine(id_user);
    res.json({
      message: 'Rutina finalizada con éxito',
      data: routine
    });
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'END_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

const getActiveRoutineWithExercises = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const routine = await userRoutineService.getActiveRoutineWithExercises(id_user);
    res.json({
      message: 'Rutina activa con ejercicios obtenida con éxito',
      data: routine
    });
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'GET_ACTIVE_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  assignRoutineToUser,
  getActiveRoutine,
  endUserRoutine,
  getActiveRoutineWithExercises
};
