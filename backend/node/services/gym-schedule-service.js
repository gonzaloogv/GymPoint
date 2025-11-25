/**
 * Gym Schedule Service - Lote 4
 * Maneja horarios regulares y especiales de gimnasios usando Commands/Queries
 */

const sequelize = require('../config/database');
const {
  gymScheduleRepository,
} = require('../infra/db/repositories');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');

// ============================================================================
// REGULAR SCHEDULES
// ============================================================================

/**
 * Crea un nuevo horario regular para un gimnasio
 * @param {CreateGymScheduleCommand} command
 * @returns {Promise<Object>} Horario creado (POJO)
 */
async function createGymSchedule(command) {
  const transaction = await sequelize.transaction();
  try {
    // Validar que no exista un horario para ese día
    const existing = await gymScheduleRepository.findScheduleByGymAndDay(
      command.gymId,
      command.day_of_week,
      { transaction }
    );

    if (existing) {
      throw new ConflictError(
        `El gimnasio ya tiene un horario registrado para "${command.day_of_week}"`
      );
    }

    // Validar horarios si no está cerrado
    if (!command.is_closed && (!command.open_time || !command.close_time)) {
      throw new ValidationError(
        'Se requieren open_time y close_time cuando el gimnasio no está cerrado'
      );
    }

    const payload = {
      id_gym: command.gymId,
      day_of_week: command.day_of_week,
      open_time: command.open_time,
      close_time: command.close_time,
      is_closed: command.is_closed,
    };

    const schedule = await gymScheduleRepository.createSchedule(payload, { transaction });
    await transaction.commit();
    return schedule;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Obtiene todos los horarios regulares de un gimnasio
 * @param {GetGymSchedulesQuery} query
 * @returns {Promise<Array>} Array de horarios (POJOs)
 */
async function getGymSchedules(query) {
  return gymScheduleRepository.findSchedulesByGymId(query.gymId);
}

/**
 * Obtiene un horario específico por ID
 * @param {GetGymScheduleQuery} query
 * @returns {Promise<Object|null>} Horario (POJO)
 */
async function getGymSchedule(query) {
  return gymScheduleRepository.findScheduleById(query.scheduleId);
}

/**
 * Actualiza un horario regular
 * @param {UpdateGymScheduleCommand} command
 * @returns {Promise<Object>} Horario actualizado (POJO)
 */
async function updateGymSchedule(command) {
  const transaction = await sequelize.transaction();
  try {
    // Verificar que existe
    const schedule = await gymScheduleRepository.findScheduleById(
      command.scheduleId,
      { transaction }
    );

    if (!schedule) {
      throw new NotFoundError('Horario no encontrado');
    }

    const payload = {};
    if (command.open_time !== undefined) payload.open_time = command.open_time;
    if (command.close_time !== undefined) payload.close_time = command.close_time;
    if (command.is_closed !== undefined) payload.is_closed = command.is_closed;

    // Validar si no está cerrado
    const isClosed = command.is_closed !== undefined ? command.is_closed : schedule.is_closed;
    if (!isClosed) {
      const openTime = command.open_time !== undefined ? command.open_time : schedule.open_time;
      const closeTime = command.close_time !== undefined ? command.close_time : schedule.close_time;

      if (!openTime || !closeTime) {
        throw new ValidationError(
          'Se requieren open_time y close_time cuando el gimnasio no está cerrado'
        );
      }
    }

    const updated = await gymScheduleRepository.updateSchedule(
      command.scheduleId,
      payload,
      { transaction }
    );

    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Elimina un horario regular
 * @param {DeleteGymScheduleCommand} command
 * @returns {Promise<number>} Número de registros eliminados
 */
async function deleteGymSchedule(command) {
  const transaction = await sequelize.transaction();
  try {
    const schedule = await gymScheduleRepository.findScheduleById(
      command.scheduleId,
      { transaction }
    );

    if (!schedule) {
      throw new NotFoundError('Horario no encontrado');
    }

    const deleted = await gymScheduleRepository.deleteSchedule(
      command.scheduleId,
      { transaction }
    );

    await transaction.commit();
    return deleted;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// SPECIAL SCHEDULES
// ============================================================================

/**
 * Crea un nuevo horario especial para un gimnasio
 * @param {CreateGymSpecialScheduleCommand} command
 * @returns {Promise<Object>} Horario especial creado (POJO)
 */
async function createGymSpecialSchedule(command) {
  const transaction = await sequelize.transaction();
  try {
    // Validar que no exista un horario especial para esa fecha
    const existing = await gymScheduleRepository.findSpecialScheduleByGymAndDate(
      command.gymId,
      command.date,
      { transaction }
    );

    if (existing) {
      throw new ConflictError(
        'Ya existe un horario especial registrado para esa fecha'
      );
    }

    // Validar horarios si no está cerrado
    if (!command.is_closed && (!command.open_time || !command.close_time)) {
      throw new ValidationError(
        'Se requieren open_time y close_time cuando el gimnasio no está cerrado'
      );
    }

    const payload = {
      id_gym: command.gymId,
      date: command.date,
      open_time: command.open_time,
      close_time: command.close_time,
      is_closed: command.is_closed,
      reason: command.reason,
    };

    const schedule = await gymScheduleRepository.createSpecialSchedule(payload, { transaction });
    await transaction.commit();
    return schedule;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Obtiene horarios especiales de un gimnasio
 * @param {GetGymSpecialSchedulesQuery} query
 * @returns {Promise<Array>} Array de horarios especiales (POJOs)
 */
async function getGymSpecialSchedules(query) {
  const filters = {};
  if (query.from_date) filters.from_date = query.from_date;
  if (query.to_date) filters.to_date = query.to_date;
  if (query.future_only) filters.future_only = query.future_only;

  return gymScheduleRepository.findSpecialSchedulesByGymId(query.gymId, filters);
}

/**
 * Obtiene un horario especial por ID
 * @param {GetGymSpecialScheduleQuery} query
 * @returns {Promise<Object|null>} Horario especial (POJO)
 */
async function getGymSpecialSchedule(query) {
  return gymScheduleRepository.findSpecialScheduleById(query.specialScheduleId);
}

/**
 * Actualiza un horario especial
 * @param {UpdateGymSpecialScheduleCommand} command
 * @returns {Promise<Object>} Horario especial actualizado (POJO)
 */
async function updateGymSpecialSchedule(command) {
  const transaction = await sequelize.transaction();
  try {
    const schedule = await gymScheduleRepository.findSpecialScheduleById(
      command.specialScheduleId,
      { transaction }
    );

    if (!schedule) {
      throw new NotFoundError('Horario especial no encontrado');
    }

    const payload = {};
    if (command.open_time !== undefined) payload.open_time = command.open_time;
    if (command.close_time !== undefined) payload.close_time = command.close_time;
    if (command.is_closed !== undefined) payload.is_closed = command.is_closed;
    if (command.reason !== undefined) payload.reason = command.reason;

    // Validar si no está cerrado
    const isClosed = command.is_closed !== undefined ? command.is_closed : schedule.is_closed;
    if (!isClosed) {
      const openTime = command.open_time !== undefined ? command.open_time : schedule.open_time;
      const closeTime = command.close_time !== undefined ? command.close_time : schedule.close_time;

      if (!openTime || !closeTime) {
        throw new ValidationError(
          'Se requieren open_time y close_time cuando el gimnasio no está cerrado'
        );
      }
    }

    const updated = await gymScheduleRepository.updateSpecialSchedule(
      command.specialScheduleId,
      payload,
      { transaction }
    );

    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Elimina un horario especial
 * @param {DeleteGymSpecialScheduleCommand} command
 * @returns {Promise<number>} Número de registros eliminados
 */
async function deleteGymSpecialSchedule(command) {
  const transaction = await sequelize.transaction();
  try {
    const schedule = await gymScheduleRepository.findSpecialScheduleById(
      command.specialScheduleId,
      { transaction }
    );

    if (!schedule) {
      throw new NotFoundError('Horario especial no encontrado');
    }

    const deleted = await gymScheduleRepository.deleteSpecialSchedule(
      command.specialScheduleId,
      { transaction }
    );

    await transaction.commit();
    return deleted;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Obtiene el horario efectivo de un gimnasio para una fecha específica
 * @param {GetEffectiveGymScheduleQuery} query
 * @returns {Promise<Object|null>} Horario efectivo (especial si existe, regular si no)
 */
async function getEffectiveGymSchedule(query) {
  // Primero buscar horario especial
  const specialSchedule = await gymScheduleRepository.findSpecialScheduleByGymAndDate(
    query.gymId,
    query.date
  );

  if (specialSchedule) {
    return {
      type: 'SPECIAL',
      schedule: specialSchedule,
    };
  }

  // Si no hay especial, buscar el regular para el día de la semana
  const date = new Date(query.date);
  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeek = daysOfWeek[date.getDay()];

  const regularSchedule = await gymScheduleRepository.findScheduleByGymAndDay(
    query.gymId,
    dayOfWeek
  );

  if (regularSchedule) {
    return {
      type: 'REGULAR',
      schedule: regularSchedule,
    };
  }

  return null;
}

module.exports = {
  // Regular schedules
  createGymSchedule,
  getGymSchedules,
  getGymSchedule,
  updateGymSchedule,
  deleteGymSchedule,

  // Special schedules
  createGymSpecialSchedule,
  getGymSpecialSchedules,
  getGymSpecialSchedule,
  updateGymSpecialSchedule,
  deleteGymSpecialSchedule,

  // Combined
  getEffectiveGymSchedule,
};
