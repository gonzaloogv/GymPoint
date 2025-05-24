const routineService = require('../services/routine-service');

const getRoutineWithExercises = async (req, res) => {
  try {
    const rutina = await routineService.getRoutineWithExercises(req.params.id);
    res.json(rutina);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const createRoutineWithExercises = async (req, res) => {
  try {
    const { routine_name, description, exercises, id_user } = req.body;

    if (!routine_name || !exercises || !id_user) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const rutina = await routineService.createRoutineWithExercises({
      routine_name,
      description,
      exercises,
      id_user
    });

    res.status(201).json(rutina);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
  console.log('BODY RECIBIDO:', req.body);

};


const updateRoutine = async (req, res) => {
    try {
      const rutina = await routineService.updateRoutine(req.params.id, req.body);
      res.json(rutina);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
};

const updateRoutineExercise = async (req, res) => {
    try {
      const { id, id_exercise } = req.params;
      const updated = await routineService.updateRoutineExercise(id, id_exercise, req.body);
      res.json(updated);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
};

const deleteRoutine = async (req, res) => {
    try {
      await routineService.deleteRoutine(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
};

const deleteRoutineExercise = async (req, res) => {
    try {
      const { id, id_exercise } = req.params;
      await routineService.deleteRoutineExercise(id, id_exercise);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
};

const getRoutinesByUser = async (req, res) => {
    try {
      const rutinas = await routineService.getRoutinesByUser(req.params.id_user);
      res.json(rutinas);
    } catch (err) {
      res.status(400).json({ error: err.message });
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
   
module.exports = {
  getRoutineWithExercises,
  createRoutineWithExercises,
  updateRoutine,
  updateRoutineExercise,
  deleteRoutine,
  deleteRoutineExercise,
  getRoutinesByUser,
  getActiveRoutineWithExercises
};
