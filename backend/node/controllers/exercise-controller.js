/**
 * Exercise Controller - Refactorizado con Mappers (Lote 7)
 * Gestiona endpoints de ejercicios
 */

const exerciseService = require('../services/exercise-service');
const exerciseMappers = require('../services/mappers/exercise.mappers');
const { NotFoundError } = require('../utils/errors');

/**
 * GET /api/exercises
 * Lista todos los ejercicios con filtros opcionales
 */
const getAllExercises = async (req, res) => {
  try {
    const query = exerciseMappers.toListExercisesQuery(req.query);
    const result = await exerciseService.listExercises(query);

    // Mapear los items al formato correcto de response
    res.json({
      items: exerciseMappers.toExercisesResponse(result.items),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'GET_EXERCISES_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/exercises/paginated
 * Lista ejercicios con paginación
 */
const listExercises = async (req, res) => {
  try {
    const query = exerciseMappers.toListExercisesQuery(req.query);
    const result = await exerciseService.listExercises(query);

    res.json(exerciseMappers.toPaginatedExercisesResponse({
      rows: result.rows,
      count: result.count,
      page: query.page,
      limit: query.limit
    }));
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'LIST_EXERCISES_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/exercises/:id
 * Obtener un ejercicio por ID
 */
const getExerciseById = async (req, res) => {
  try {
    const query = exerciseMappers.toGetExerciseByIdQuery(Number.parseInt(req.params.id, 10));
    const exercise = await exerciseService.getExerciseById(query);

    res.json({
      data: exerciseMappers.toExerciseResponse(exercise)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'EXERCISE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'GET_EXERCISE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * POST /api/exercises
 * Crear un nuevo ejercicio
 */
const createExercise = async (req, res) => {
  try {
    const userProfileId = req.user?.id_user_profile;

    // Agregar created_by automáticamente
    const exerciseData = {
      ...req.body,
      created_by: userProfileId || null,
      createdBy: userProfileId || null
    };

    const command = exerciseMappers.toCreateExerciseCommand(exerciseData);
    const exercise = await exerciseService.createExercise(command);

    res.status(201).json({
      message: 'Ejercicio creado con éxito',
      data: exerciseMappers.toExerciseResponse(exercise)
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

/**
 * PUT /api/exercises/:id
 * Actualizar un ejercicio existente
 */
const updateExercise = async (req, res) => {
  try {
    const command = exerciseMappers.toUpdateExerciseCommand(req.body, Number.parseInt(req.params.id, 10));
    const exercise = await exerciseService.updateExercise(command);

    res.json({
      message: 'Ejercicio actualizado con éxito',
      data: exerciseMappers.toExerciseResponse(exercise)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'EXERCISE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'UPDATE_EXERCISE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * DELETE /api/exercises/:id
 * Eliminar un ejercicio (solo el creador o admin)
 */
const deleteExercise = async (req, res) => {
  try {
    const Exercise = require('../models/Exercise');
    const exerciseId = Number.parseInt(req.params.id, 10);
    const exercise = await Exercise.findByPk(exerciseId);

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

    const command = exerciseMappers.toDeleteExerciseCommand(exerciseId);
    await exerciseService.deleteExercise(command);

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
  listExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
};
