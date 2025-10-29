/**
 * UserRoutine Controller - Refactorizado con Mappers (Lote 7)
 * Gestiona endpoints de rutinas asignadas a usuarios
 */

const userRoutineService = require('../services/user-routine-service');
const userRoutineMappers = require('../services/mappers/user-routine.mappers');
const routineMappers = require('../services/mappers/routine.mappers');
const { NotFoundError, ValidationError, BusinessError } = require('../utils/errors');

/**
 * POST /api/user-routines/assign
 * Asignar una rutina a un usuario
 */
const assignRoutineToUser = async (req, res) => {
  try {
    const idUser = req.user.id || req.user.id_user_profile;
    const command = userRoutineMappers.toAssignRoutineToUserCommand(req.body, idUser);
    const userRoutine = await userRoutineService.assignRoutineToUser(command);

    res.status(201).json({
      message: 'Rutina asignada con éxito',
      data: userRoutineMappers.toUserRoutineResponse(userRoutine)
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message
        }
      });
    }
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
        code: 'ASSIGN_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/user-routines/active
 * Obtener rutina activa del usuario autenticado
 */
const getActiveRoutine = async (req, res) => {
  try {
    const idUser = req.user.id || req.user.id_user_profile;
    const query = userRoutineMappers.toGetActiveUserRoutineQuery(idUser);
    const userRoutine = await userRoutineService.getActiveUserRoutine(query);

    if (!userRoutine) {
      return res.status(404).json({
        error: {
          code: 'NO_ACTIVE_ROUTINE',
          message: 'No hay rutina activa'
        }
      });
    }

    res.json({
      data: userRoutineMappers.toUserRoutineResponse(userRoutine)
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'GET_ACTIVE_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/user-routines/active/details
 * Obtener rutina activa con ejercicios
 */
const getActiveRoutineWithExercises = async (req, res) => {
  try {
    const idUser = req.user.id || req.user.id_user_profile;
    const query = userRoutineMappers.toGetActiveRoutineWithExercisesQuery(idUser);
    const routine = await userRoutineService.getActiveRoutineWithExercises(query);

    res.json({
      message: 'Rutina activa obtenida con éxito',
      data: routine // Ya viene formateado del servicio
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'NO_ACTIVE_ROUTINE',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'GET_ACTIVE_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/user-routines/me
 * Listar rutinas del usuario con paginación
 */
const listMyRoutines = async (req, res) => {
  try {
    const idUser = req.user.id || req.user.id_user_profile;
    const query = userRoutineMappers.toListUserRoutinesQuery(req.query, idUser);
    const userRoutines = await userRoutineService.listUserRoutines(query);

    res.json({
      data: userRoutineMappers.toUserRoutinesResponse(userRoutines)
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'LIST_USER_ROUTINES_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/user-routines/:id
 * Obtener una rutina específica del usuario
 */
const getUserRoutineById = async (req, res) => {
  try {
    const query = userRoutineMappers.toGetUserRoutineByIdQuery(Number.parseInt(req.params.id, 10));
    const userRoutine = await userRoutineService.getUserRoutineById(query);

    res.json({
      data: userRoutineMappers.toUserRoutineResponse(userRoutine)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'USER_ROUTINE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'GET_USER_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * GET /api/user-routines/counts
 * Obtener contadores de rutinas del usuario (created, imported, total)
 */
const getUserRoutineCounts = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const query = userRoutineMappers.toGetUserRoutineCountsQuery(idUserProfile);
    const counts = await userRoutineService.getUserRoutineCounts(query);

    res.json({
      data: userRoutineMappers.toUserRoutineCountsResponse(counts)
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'GET_COUNTS_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * POST /api/user-routines/end
 * Finalizar la rutina activa del usuario
 */
const endUserRoutine = async (req, res) => {
  try {
    const idUser = req.user.id || req.user.id_user_profile;
    const command = userRoutineMappers.toEndUserRoutineCommand(idUser);
    const userRoutine = await userRoutineService.endUserRoutine(command);

    res.json({
      message: 'Rutina finalizada con éxito',
      data: userRoutineMappers.toUserRoutineResponse(userRoutine)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'NO_ACTIVE_ROUTINE',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'END_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * POST /api/user-routines/import
 * Importar una rutina template (crea una copia para el usuario)
 */
const importRoutine = async (req, res) => {
  try {
    const idUserProfile = req.user.id_user_profile;
    const command = userRoutineMappers.toImportRoutineCommand(req.body, idUserProfile);
    const routine = await userRoutineService.importRoutine(command);

    res.status(201).json({
      message: 'Rutina importada con éxito',
      data: routineMappers.toRoutineResponse(routine)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'TEMPLATE_NOT_FOUND',
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
    if (err instanceof BusinessError) {
      return res.status(400).json({
        error: {
          code: err.code || 'LIMIT_EXCEEDED',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'IMPORT_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * PUT /api/user-routines/:id/deactivate
 * Desactivar una rutina específica
 */
const deactivateUserRoutine = async (req, res) => {
  try {
    const command = userRoutineMappers.toDeactivateUserRoutineCommand(Number.parseInt(req.params.id, 10));
    const userRoutine = await userRoutineService.deactivateUserRoutine(command);

    res.json({
      message: 'Rutina desactivada con éxito',
      data: userRoutineMappers.toUserRoutineResponse(userRoutine)
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: 'USER_ROUTINE_NOT_FOUND',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'DEACTIVATE_ROUTINE_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  assignRoutineToUser,
  getActiveRoutine,
  getActiveRoutineWithExercises,
  listMyRoutines,
  getUserRoutineById,
  getUserRoutineCounts,
  endUserRoutine,
  importRoutine,
  deactivateUserRoutine
};
