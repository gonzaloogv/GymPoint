const exerciseService = require('../services/exercise-service');

const getAllExercises = async (req, res) => {
  const exercises = await exerciseService.getAllExercises();
  res.json({ data: exercises, message: 'Ejercicios obtenidos con éxito' });
};

const getExerciseById = async (req, res) => {
  const exercise = await exerciseService.getExerciseById(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Ejercicio no encontrado' });
  res.json({ data: exercise, message: 'Ejercicio obtenido con éxito' });
};

/**
 * Crear ejercicio
 * @route POST /api/exercises
 * @access Private
 */
const createExercise = async (req, res) => {
  try {
    const userProfileId = req.user?.id_user_profile;
    
    // Agregar created_by automáticamente
    const exerciseData = {
      ...req.body,
      created_by: userProfileId || null
    };
    
    const exercise = await exerciseService.createExercise(exerciseData);
    res.status(201).json({
      message: 'Ejercicio creado con éxito',
      data: exercise
    });
  } catch (err) {
    console.error('Error en createExercise:', err.message);
    res.status(400).json({ 
      error: { 
        code: 'CREATE_EXERCISE_FAILED', 
        message: err.message 
      } 
    });
  }
};

const updateExercise = async (req, res) => {
  try {
    const exercise = await exerciseService.updateExercise(req.params.id, req.body);
    res.json({ data: exercise, message: 'Ejercicio actualizado con éxito' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/**
 * Eliminar ejercicio
 * @route DELETE /api/exercises/:id
 * @access Private (Solo el creador o admin)
 */
const deleteExercise = async (req, res) => {
  try {
    const Exercise = require('../models/Exercise');
    const exercise = await Exercise.findByPk(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ 
        error: { 
          code: 'EXERCISE_NOT_FOUND', 
          message: 'Ejercicio no encontrado' 
        } 
      });
    }

    // Verificar ownership: solo el creador puede borrar
    // NULL = ejercicio del sistema (solo admin puede borrar)
    const userProfileId = req.user?.id_user_profile;
    const isAdmin = req.roles?.includes('ADMIN');
    
    if (exercise.created_by === null) {
      // Ejercicio del sistema: solo admin
      if (!isAdmin) {
        return res.status(403).json({ 
          error: { 
            code: 'FORBIDDEN', 
            message: 'Solo administradores pueden borrar ejercicios del sistema' 
          } 
        });
      }
    } else if (exercise.created_by !== userProfileId && !isAdmin) {
      // Ejercicio de usuario: solo el creador o admin
      return res.status(403).json({ 
        error: { 
          code: 'FORBIDDEN', 
          message: 'No eres el propietario de este ejercicio' 
        } 
      });
    }

    await exerciseService.deleteExercise(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Error en deleteExercise:', err.message);
    res.status(500).json({ 
      error: { 
        code: 'DELETE_EXERCISE_FAILED', 
        message: err.message 
      } 
    });
  }
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
};
