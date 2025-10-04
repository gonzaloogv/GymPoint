const routineService = require('../services/routine-service');
const userRoutineService = require('../services/user-routine-service');

/**
 * Obtener rutina con ejercicios
 * @route GET /api/routines/:id
 * @access Public
 */
const getRoutineWithExercises = async (req, res) => {
  try {
    const rutina = await routineService.getRoutineWithExercises(req.params.id);
    
    res.json({
      message: 'Rutina obtenida con éxito',
      data: rutina
    });
  } catch (err) {
    res.status(404).json({ 
      error: { 
        code: 'ROUTINE_NOT_FOUND', 
        message: err.message 
      } 
    });
  }
};

/**
 * Crear rutina con ejercicios
 * @route POST /api/routines
 * @access Private (Usuario app)
 */
const createRoutineWithExercises = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const { routine_name, description, exercises } = req.body;

    if (!routine_name || !exercises) {
      return res.status(400).json({ 
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'Faltan datos requeridos: routine_name, exercises' 
        } 
      });
    }

    if (!Array.isArray(exercises) || exercises.length < 3) {
      return res.status(400).json({ 
        error: { 
          code: 'INVALID_EXERCISES', 
          message: 'La rutina debe tener al menos 3 ejercicios' 
        } 
      });
    }

    const rutina = await routineService.createRoutineWithExercises({
      routine_name,
      description,
      exercises,
      id_user: id_user_profile // El service espera id_user
    });

    res.status(201).json({
      message: 'Rutina creada con éxito',
      data: rutina
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'CREATE_ROUTINE_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Actualizar rutina
 * @route PUT /api/routines/:id
 * @access Private (Usuario app - propietario)
 */
const updateRoutine = async (req, res) => {
  try {
    const rutina = await routineService.updateRoutine(req.params.id, req.body);
    
    res.json({
      message: 'Rutina actualizada con éxito',
      data: rutina
    });
  } catch (err) {
    res.status(404).json({ 
      error: { 
        code: 'UPDATE_ROUTINE_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Actualizar ejercicio de una rutina
 * @route PUT /api/routines/:id/exercises/:id_exercise
 * @access Private (Usuario app - propietario)
 */
const updateRoutineExercise = async (req, res) => {
  try {
    const { id, id_exercise } = req.params;
    const updated = await routineService.updateRoutineExercise(id, id_exercise, req.body);
    
    res.json({
      message: 'Ejercicio de rutina actualizado con éxito',
      data: updated
    });
  } catch (err) {
    res.status(404).json({ 
      error: { 
        code: 'UPDATE_ROUTINE_EXERCISE_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Eliminar rutina
 * @route DELETE /api/routines/:id
 * @access Private (Usuario app - propietario)
 */
const deleteRoutine = async (req, res) => {
  try {
    await routineService.deleteRoutine(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ 
      error: { 
        code: 'DELETE_ROUTINE_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Eliminar ejercicio de una rutina
 * @route DELETE /api/routines/:id/exercises/:id_exercise
 * @access Private (Usuario app - propietario)
 */
const deleteRoutineExercise = async (req, res) => {
  try {
    const { id, id_exercise } = req.params;
    await routineService.deleteRoutineExercise(id, id_exercise);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ 
      error: { 
        code: 'DELETE_ROUTINE_EXERCISE_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener rutinas del usuario autenticado
 * @route GET /api/routines/me
 * @access Private (Usuario app)
 */
const getRoutinesByUser = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const rutinas = await routineService.getRoutinesByUser(id_user_profile);
    
    res.json({
      message: 'Rutinas del usuario obtenidas con éxito',
      data: rutinas
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_USER_ROUTINES_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener rutina activa de un usuario
 * @route GET /api/routines/user/:id_user/active
 * @access Private
 */
const getActiveRoutineWithExercises = async (req, res) => {
  try {
    const routine = await userRoutineService.getActiveRoutineWithExercises(req.params.id_user);
    
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
