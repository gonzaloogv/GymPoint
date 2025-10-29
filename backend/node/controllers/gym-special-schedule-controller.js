/**
 * Gym Special Schedule Controller - CRUD completo
 * Sigue arquitectura OpenAPI-first
 */

const service = require('../services/gym-special-schedule-service');
const GymSpecialSchedule = require('../models/GymSpecialSchedule');

/**
 * GET /api/gym-special-schedules/:gymId
 * Lista horarios especiales de un gimnasio
 */
const listGymSpecialSchedules = async (req, res) => {
  try {
    // Support both gymId (OpenAPI) and id_gym (legacy) parameter names
    const gymId = req.params.gymId || req.params.id_gym;
    const resultado = await service.obtenerHorariosEspecialesPorGimnasio(Number.Number.parseInt(gymId, 10));
    res.json(resultado);
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'GET_SPECIAL_SCHEDULES_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * POST /api/gym-special-schedules/:gymId
 * Crear un horario especial
 */
const createGymSpecialSchedule = async (req, res) => {
  try {
    // Support both gymId (OpenAPI) and id_gym (legacy) parameter names
    const gymId = req.params.gymId || req.params.id_gym;
    const { date, opening_time, closing_time, closed, motive } = req.body;

    if (!date || closed === undefined || !motive) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Faltan datos requeridos: date, closed, motive'
        }
      });
    }

    const resultado = await service.crearHorarioEspecial({
      id_gym: Number.Number.parseInt(gymId, 10),
      date,
      opening_time,
      closing_time,
      closed,
      motive
    });

    res.status(201).json(resultado);
  } catch (err) {
    if (err.message.includes('Ya existe')) {
      return res.status(409).json({
        error: {
          code: 'SCHEDULE_ALREADY_EXISTS',
          message: err.message
        }
      });
    }
    res.status(400).json({
      error: {
        code: 'CREATE_SPECIAL_SCHEDULE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * PUT /api/gym-special-schedules/:id
 * Actualizar un horario especial
 */
const updateGymSpecialSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_gym, date, opening_time, closing_time, closed, motive } = req.body;

    const schedule = await GymSpecialSchedule.findByPk(Number.Number.parseInt(id, 10));

    if (!schedule) {
      return res.status(404).json({
        error: {
          code: 'SPECIAL_SCHEDULE_NOT_FOUND',
          message: 'Horario especial no encontrado'
        }
      });
    }

    const updateData = {};
    if (id_gym !== undefined) updateData.id_gym = id_gym;
    if (date !== undefined) updateData.date = date;
    if (opening_time !== undefined) updateData.opening_time = opening_time;
    if (closing_time !== undefined) updateData.closing_time = closing_time;
    if (closed !== undefined) {
      updateData.closed = closed;
      if (closed) {
        updateData.opening_time = null;
        updateData.closing_time = null;
      }
    }
    if (motive !== undefined) updateData.motive = motive;

    await schedule.update(updateData);
    await schedule.reload();

    res.json(schedule);
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'UPDATE_SPECIAL_SCHEDULE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * DELETE /api/gym-special-schedules/:id
 * Eliminar un horario especial
 */
const deleteGymSpecialSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await GymSpecialSchedule.findByPk(Number.Number.parseInt(id, 10));

    if (!schedule) {
      return res.status(404).json({
        error: {
          code: 'SPECIAL_SCHEDULE_NOT_FOUND',
          message: 'Horario especial no encontrado'
        }
      });
    }

    await schedule.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'DELETE_SPECIAL_SCHEDULE_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  listGymSpecialSchedules,
  createGymSpecialSchedule,
  updateGymSpecialSchedule,
  deleteGymSpecialSchedule,
  // Legacy aliases
  crearHorarioEspecial: createGymSpecialSchedule,
  obtenerHorariosEspecialesPorGimnasio: listGymSpecialSchedules
};
