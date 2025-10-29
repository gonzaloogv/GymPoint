/**
 * Routine Controller - Refactorizado con Mappers (Lote 7)
 * Gestiona endpoints de rutinas, días de rutina y ejercicios en rutinas
 */

const routineService = require('../services/routine-service');
const routineMappers = require('../services/mappers/routine.mappers');
const { NotFoundError, ValidationError, BusinessError } = require('../utils/errors');

/**
 * GET /api/routines/:id
 * Obtener rutina con ejercicios y días
 */
const getRoutineWithExercises = async (req, res) => {
  try {
    const query = routineMappers.toGetRoutineWithExercisesQuery(Number.parseInt(req.params.id, 10));
    const routine = await routineService.getRoutineWithExercises(query);

    res.json({
      message: 'Rutina obtenida con éxito',
      data: routineMappers.toRoutineResponse(routine)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'GET_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/routines/me
 * Obtener rutinas del usuario autenticado
 */
const getRoutinesByUser = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const query = routineMappers.toListRoutinesByUserQuery(req.query, idUserProfile);
    const routines = await routineService.listRoutinesByUser(query);

    res.json({
      message: 'Rutinas del usuario obtenidas con éxito',
      data: routineMappers.toRoutinesResponse(routines)
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
 * GET /api/routines/templates
 * Listar plantillas de rutinas
 */
const listRoutineTemplates = async (req, res) => {
  try {
    const query = routineMappers.toListRoutineTemplatesQuery(req.query);
    const result = await routineService.listRoutineTemplates(query);

    res.json(routineMappers.toPaginatedRoutinesResponse({
      rows: result.rows,
      count: result.count,
      page: query.page,
      limit: query.limit
    }));
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'LIST_TEMPLATES_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * POST /api/routines
 * Crear rutina con ejercicios y días
 */
const createRoutineWithExercises = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;

    // Validar campos requeridos
    if (!req.body.routine_name || !req.body.exercises) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Faltan datos requeridos: routine_name, exercises'
        }
      });
    }

    if (!Array.isArray(req.body.exercises) || req.body.exercises.length < 3) {
      return res.status(400).json({
        error: {
          code: 'INVALID_EXERCISES',
          message: 'La rutina debe tener al menos 3 ejercicios'
        }
      });
    }

    const command = routineMappers.toCreateRoutineWithExercisesCommand(req.body, idUserProfile);
    const routine = await routineService.createRoutineWithExercises(command);

    res.status(201).json({
      message: 'Rutina creada con éxito',
      data: routineMappers.toRoutineResponse(routine)
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof BusinessError) {
      return res.status(400).json({
        error: {
          code: err.code || 'CREATE_ROUTINE_FAILED',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'CREATE_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * PUT /api/routines/:id
 * Actualizar rutina básica
 */
const updateRoutine = async (req, res) => {
  try {
    const command = routineMappers.toUpdateRoutineCommand(req.body, Number.parseInt(req.params.id, 10));
    const routine = await routineService.updateRoutine(command);

    res.json({
      message: 'Rutina actualizada con éxito',
      data: routineMappers.toRoutineResponse(routine)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'UPDATE_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * DELETE /api/routines/:id
 * Eliminar rutina
 */
const deleteRoutine = async (req, res) => {
  try {
    const command = routineMappers.toDeleteRoutineCommand(Number.parseInt(req.params.id, 10));
    await routineService.deleteRoutine(command);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'DELETE_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * POST /api/routines/:id/exercises
 * Agregar ejercicio a rutina
 */
const addExerciseToRoutine = async (req, res) => {
  try {
    const command = routineMappers.toAddExerciseToRoutineCommand(req.body, Number.parseInt(req.params.id, 10));
    const routineExercise = await routineService.addExerciseToRoutine(command);

    res.status(201).json({
      message: 'Ejercicio agregado a rutina con éxito',
      data: routineMappers.toRoutineExerciseResponse(routineExercise)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'ADD_EXERCISE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * PUT /api/routines/:id/exercises/:id_exercise
 * Actualizar ejercicio en rutina
 */
const updateRoutineExercise = async (req, res) => {
  try {
    const { id, id_exercise } = req.params;
    const command = routineMappers.toUpdateRoutineExerciseCommand(
      req.body,
      Number.parseInt(id, 10),
      Number.parseInt(id_exercise, 10)
    );
    const routineExercise = await routineService.updateRoutineExercise(command);

    res.json({
      message: 'Ejercicio de rutina actualizado con éxito',
      data: routineMappers.toRoutineExerciseResponse(routineExercise)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_EXERCISE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'UPDATE_ROUTINE_EXERCISE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * DELETE /api/routines/:id/exercises/:id_exercise
 * Eliminar ejercicio de rutina
 */
const deleteRoutineExercise = async (req, res) => {
  try {
    const { id, id_exercise } = req.params;
    const command = routineMappers.toDeleteRoutineExerciseCommand(Number.parseInt(id, 10), Number.parseInt(id_exercise, 10));
    await routineService.deleteRoutineExercise(command);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_EXERCISE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'DELETE_ROUTINE_EXERCISE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/routines/:id/days
 * Listar días de una rutina
 */
const listRoutineDays = async (req, res) => {
  try {
    const query = routineMappers.toListRoutineDaysQuery(Number.parseInt(req.params.id, 10));
    const days = await routineService.listRoutineDays(query);

    res.json({
      message: 'Días de rutina obtenidos con éxito',
      data: routineMappers.toRoutineDaysResponse(days)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'LIST_ROUTINE_DAYS_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * POST /api/routines/:id/days
 * Crear día de rutina
 */
const createRoutineDay = async (req, res) => {
  try {
    const command = routineMappers.toCreateRoutineDayCommand(req.body, Number.parseInt(req.params.id, 10));
    const day = await routineService.createRoutineDay(command);

    res.status(201).json({
      message: 'Día de rutina creado con éxito',
      data: routineMappers.toRoutineDayResponse(day)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_NOT_FOUND',
          message: err.message
        }
      });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'CREATE_DAY_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * PUT /api/routines/days/:id_routine_day
 * Actualizar día de rutina
 */
const updateRoutineDay = async (req, res) => {
  try {
    const command = routineMappers.toUpdateRoutineDayCommand(req.body, Number.parseInt(req.params.id_routine_day, 10));
    const day = await routineService.updateRoutineDay(command);

    res.json({
      message: 'Día de rutina actualizado con éxito',
      data: routineMappers.toRoutineDayResponse(day)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_DAY_NOT_FOUND',
          message: err.message
        }
      });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'UPDATE_DAY_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * DELETE /api/routines/days/:id_routine_day
 * Eliminar día de rutina
 */
const deleteRoutineDay = async (req, res) => {
  try {
    const command = routineMappers.toDeleteRoutineDayCommand(Number.parseInt(req.params.id_routine_day, 10));
    await routineService.deleteRoutineDay(command);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'ROUTINE_DAY_NOT_FOUND',
          message: err.message
        }
      });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'DELETE_DAY_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  getRoutineWithExercises,
  getRoutinesByUser,
  listRoutineTemplates,
  createRoutineWithExercises,
  updateRoutine,
  deleteRoutine,
  addExerciseToRoutine,
  updateRoutineExercise,
  deleteRoutineExercise,
  listRoutineDays,
  createRoutineDay,
  updateRoutineDay,
  deleteRoutineDay
};
