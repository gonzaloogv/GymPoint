/**
 * Gym Schedule Controller - Lote 4
 * Maneja endpoints de horarios regulares y especiales de gimnasios
 */

const gymScheduleService = require('../services/gym-schedule-service');
const {
  gymScheduleMappers,
} = require('../services/mappers');

// ============================================================================
// REGULAR SCHEDULES
// ============================================================================

/**
 * GET /api/gyms/:gymId/schedules
 * Lista los horarios regulares de un gimnasio
 */
const listGymSchedules = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);

    const query = gymScheduleMappers.toGetGymSchedulesQuery(gymId);
    const schedules = await gymScheduleService.getGymSchedules(query);
    const dto = gymScheduleMappers.toGymSchedulesDTO(schedules);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_SCHEDULES_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/gyms/:gymId/schedules/:scheduleId
 * Obtiene un horario regular específico
 */
const getGymSchedule = async (req, res) => {
  try {
    const scheduleId = Number.parseInt(req.params.scheduleId, 10);

    const query = gymScheduleMappers.toGetGymScheduleQuery(scheduleId);
    const schedule = await gymScheduleService.getGymSchedule(query);

    if (!schedule) {
      return res.status(404).json({
        error: {
          code: 'SCHEDULE_NOT_FOUND',
          message: 'Horario no encontrado',
        },
      });
    }

    const dto = gymScheduleMappers.toGymScheduleDTO(schedule);
    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/gyms/:gymId/schedules
 * Crea un nuevo horario regular
 */
const createGymSchedule = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);
    const createdBy = req.account?.userProfile?.id_user_profile;

    const command = gymScheduleMappers.toCreateGymScheduleCommand(req.body, gymId, createdBy);
    const schedule = await gymScheduleService.createGymSchedule(command);
    const dto = gymScheduleMappers.toGymScheduleDTO(schedule);

    res.status(201).json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'CREATE_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * PATCH /api/gyms/:gymId/schedules/:scheduleId
 * Actualiza un horario regular
 */
const updateGymSchedule = async (req, res) => {
  try {
    const scheduleId = Number.parseInt(req.params.scheduleId, 10);
    const updatedBy = req.account?.userProfile?.id_user_profile;

    const command = gymScheduleMappers.toUpdateGymScheduleCommand(req.body, scheduleId, updatedBy);
    const schedule = await gymScheduleService.updateGymSchedule(command);
    const dto = gymScheduleMappers.toGymScheduleDTO(schedule);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'UPDATE_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * DELETE /api/gyms/:gymId/schedules/:scheduleId
 * Elimina un horario regular
 */
const deleteGymSchedule = async (req, res) => {
  try {
    const scheduleId = Number.parseInt(req.params.scheduleId, 10);
    const deletedBy = req.account?.userProfile?.id_user_profile;

    const command = gymScheduleMappers.toDeleteGymScheduleCommand(scheduleId, deletedBy);
    await gymScheduleService.deleteGymSchedule(command);

    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'DELETE_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

// ============================================================================
// SPECIAL SCHEDULES
// ============================================================================

/**
 * GET /api/gyms/:gymId/special-schedules
 * Lista los horarios especiales de un gimnasio
 */
const listGymSpecialSchedules = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);
    const { from_date, to_date, future_only } = req.query;

    const query = gymScheduleMappers.toListGymSpecialSchedulesQuery(gymId, {
      from_date,
      to_date,
      future_only: future_only === 'true',
    });

    const schedules = await gymScheduleService.getGymSpecialSchedules(query);
    const dto = gymScheduleMappers.toGymSpecialSchedulesDTO(schedules);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_SPECIAL_SCHEDULES_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/gyms/:gymId/special-schedules/:specialScheduleId
 * Obtiene un horario especial específico
 */
const getGymSpecialSchedule = async (req, res) => {
  try {
    const specialScheduleId = Number.parseInt(req.params.specialScheduleId, 10);

    const query = gymScheduleMappers.toGetGymSpecialScheduleQuery(specialScheduleId);
    const schedule = await gymScheduleService.getGymSpecialSchedule(query);

    if (!schedule) {
      return res.status(404).json({
        error: {
          code: 'SPECIAL_SCHEDULE_NOT_FOUND',
          message: 'Horario especial no encontrado',
        },
      });
    }

    const dto = gymScheduleMappers.toGymSpecialScheduleDTO(schedule);
    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_SPECIAL_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/gyms/:gymId/special-schedules
 * Crea un nuevo horario especial
 */
const createGymSpecialSchedule = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);
    const createdBy = req.account?.userProfile?.id_user_profile;

    const command = gymScheduleMappers.toCreateGymSpecialScheduleCommand(req.body, gymId, createdBy);
    const schedule = await gymScheduleService.createGymSpecialSchedule(command);
    const dto = gymScheduleMappers.toGymSpecialScheduleDTO(schedule);

    res.status(201).json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'CREATE_SPECIAL_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * PATCH /api/gyms/:gymId/special-schedules/:specialScheduleId
 * Actualiza un horario especial
 */
const updateGymSpecialSchedule = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);
    const specialScheduleId = Number.parseInt(req.params.specialScheduleId, 10);
    const updatedBy = req.account?.userProfile?.id_user_profile;

    const command = gymScheduleMappers.toUpdateGymSpecialScheduleCommand(
      req.body,
      specialScheduleId,
      gymId,
      updatedBy
    );
    const schedule = await gymScheduleService.updateGymSpecialSchedule(command);
    const dto = gymScheduleMappers.toGymSpecialScheduleDTO(schedule);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'UPDATE_SPECIAL_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * DELETE /api/gyms/:gymId/special-schedules/:specialScheduleId
 * Elimina un horario especial
 */
const deleteGymSpecialSchedule = async (req, res) => {
  try {
    const specialScheduleId = Number.parseInt(req.params.specialScheduleId, 10);
    const deletedBy = req.account?.userProfile?.id_user_profile;

    const command = gymScheduleMappers.toDeleteGymSpecialScheduleCommand(
      specialScheduleId,
      deletedBy
    );
    await gymScheduleService.deleteGymSpecialSchedule(command);

    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'DELETE_SPECIAL_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/gyms/:gymId/schedule/effective
 * Obtiene el horario efectivo para una fecha específica
 */
const getEffectiveGymSchedule = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        error: {
          code: 'MISSING_DATE',
          message: 'El parámetro "date" es requerido',
        },
      });
    }

    const query = gymScheduleMappers.toGetEffectiveGymScheduleQuery(gymId, date);
    const result = await gymScheduleService.getEffectiveGymSchedule(query);

    if (!result) {
      return res.status(404).json({
        error: {
          code: 'NO_SCHEDULE_FOUND',
          message: 'No se encontró horario para esta fecha',
        },
      });
    }

    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_EFFECTIVE_SCHEDULE_FAILED',
        message: error.message,
      },
    });
  }
};

// ============================================================================
// LEGACY WRAPPERS
// ============================================================================

/**
 * Wrapper legacy para obtener horarios por gimnasio
 * Convierte req.params.id_gym a req.params.gymId
 */
const obtenerHorariosPorGimnasio = async (req, res) => {
  req.params.gymId = req.params.id_gym;
  return listGymSchedules(req, res);
};

/**
 * Wrapper legacy para actualizar horario
 * Convierte req.params.id_schedule a req.params.scheduleId
 */
const actualizarHorario = async (req, res) => {
  req.params.scheduleId = req.params.id_schedule;
  return updateGymSchedule(req, res);
};

/**
 * Wrapper legacy para crear horario
 * Extrae id_gym del body y lo pone en params
 */
const crearHorario = async (req, res) => {
  if (req.body.id_gym) {
    req.params.gymId = req.body.id_gym;
  }
  return createGymSchedule(req, res);
};

module.exports = {
  // Regular schedules
  listGymSchedules,
  getGymSchedule,
  createGymSchedule,
  updateGymSchedule,
  deleteGymSchedule,

  // Special schedules
  listGymSpecialSchedules,
  getGymSpecialSchedule,
  createGymSpecialSchedule,
  updateGymSpecialSchedule,
  deleteGymSpecialSchedule,

  // Combined
  getEffectiveGymSchedule,

  // Legacy compatibility (old function names with wrappers)
  crearHorario,
  obtenerHorariosPorGimnasio,
  actualizarHorario,
  crearHorarioEspecial: createGymSpecialSchedule,
  obtenerHorariosEspecialesPorGimnasio: listGymSpecialSchedules,
};
