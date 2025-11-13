/**
 * Commands para el dominio Gym Schedules (Horarios y Horarios Especiales)
 *
 * Los Commands son objetos puros (POJOs) que representan una intención
 * de modificar el estado del sistema. No contienen lógica de negocio.
 *
 * Cobertura:
 * - GymSchedule: Horarios regulares semanales
 * - GymSpecialSchedule: Horarios especiales (feriados, cierres)
 */

/**
 * Command para crear un horario regular de gimnasio
 *
 * @typedef {Object} CreateGymScheduleCommand
 * @property {number} gymId - ID del gimnasio
 * @property {number} day_of_week - Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
 * @property {string} open_time - Hora de apertura (formato HH:MM:SS)
 * @property {string} close_time - Hora de cierre (formato HH:MM:SS)
 * @property {boolean} [is_closed=false] - Si está cerrado ese día
 * @property {number} createdBy - ID del admin que crea el horario
 */
class CreateGymScheduleCommand {
  constructor({
    gymId,
    day_of_week,
    open_time,
    close_time,
    is_closed = false,
    createdBy,
  }) {
    this.gymId = gymId;
    this.day_of_week = day_of_week;
    this.open_time = open_time;
    this.close_time = close_time;
    this.is_closed = is_closed;
    this.createdBy = createdBy;
  }
}

/**
 * Command para actualizar un horario regular de gimnasio
 *
 * @typedef {Object} UpdateGymScheduleCommand
 * @property {number} scheduleId - ID del horario
 * @property {number} gymId - ID del gimnasio
 * @property {string} [open_time] - Hora de apertura
 * @property {string} [close_time] - Hora de cierre
 * @property {boolean} [is_closed] - Si está cerrado ese día
 * @property {number} updatedBy - ID del admin que actualiza
 */
class UpdateGymScheduleCommand {
  constructor({
    scheduleId,
    gymId,
    open_time,
    close_time,
    is_closed,
    updatedBy,
  }) {
    this.scheduleId = scheduleId;
    this.gymId = gymId;
    this.open_time = open_time;
    this.close_time = close_time;
    this.is_closed = is_closed;
    this.updatedBy = updatedBy;
  }
}

/**
 * Command para eliminar un horario regular de gimnasio
 *
 * @typedef {Object} DeleteGymScheduleCommand
 * @property {number} scheduleId - ID del horario
 * @property {number} gymId - ID del gimnasio
 * @property {number} deletedBy - ID del admin que elimina
 */
class DeleteGymScheduleCommand {
  constructor({ scheduleId, gymId, deletedBy }) {
    this.scheduleId = scheduleId;
    this.gymId = gymId;
    this.deletedBy = deletedBy;
  }
}

/**
 * Command para crear un horario especial (feriado, cierre excepcional)
 *
 * @typedef {Object} CreateGymSpecialScheduleCommand
 * @property {number} gymId - ID del gimnasio
 * @property {Date} special_date - Fecha del horario especial
 * @property {string} [open_time] - Hora de apertura (null si está cerrado)
 * @property {string} [close_time] - Hora de cierre (null si está cerrado)
 * @property {boolean} [is_closed=false] - Si está cerrado ese día
 * @property {string} [reason] - Razón del horario especial (ej: "Feriado Nacional")
 * @property {number} createdBy - ID del admin que crea
 */
class CreateGymSpecialScheduleCommand {
  constructor({
    gymId,
    date,
    open_time = null,
    close_time = null,
    is_closed = false,
    reason = null,
    createdBy,
  }) {
    this.gymId = gymId;
    this.date = date;
    this.open_time = open_time;
    this.close_time = close_time;
    this.is_closed = is_closed;
    this.reason = reason;
    this.createdBy = createdBy;
  }
}

/**
 * Command para actualizar un horario especial
 *
 * @typedef {Object} UpdateGymSpecialScheduleCommand
 * @property {number} specialScheduleId - ID del horario especial
 * @property {number} gymId - ID del gimnasio
 * @property {string} [open_time] - Hora de apertura
 * @property {string} [close_time] - Hora de cierre
 * @property {boolean} [is_closed] - Si está cerrado
 * @property {string} [reason] - Razón del horario especial
 * @property {number} updatedBy - ID del admin que actualiza
 */
class UpdateGymSpecialScheduleCommand {
  constructor({
    specialScheduleId,
    gymId,
    open_time,
    close_time,
    is_closed,
    reason,
    updatedBy,
  }) {
    this.specialScheduleId = specialScheduleId;
    this.gymId = gymId;
    this.open_time = open_time;
    this.close_time = close_time;
    this.is_closed = is_closed;
    this.reason = reason;
    this.updatedBy = updatedBy;
  }
}

/**
 * Command para eliminar un horario especial
 *
 * @typedef {Object} DeleteGymSpecialScheduleCommand
 * @property {number} specialScheduleId - ID del horario especial
 * @property {number} gymId - ID del gimnasio
 * @property {number} deletedBy - ID del admin que elimina
 */
class DeleteGymSpecialScheduleCommand {
  constructor({ specialScheduleId, gymId, deletedBy }) {
    this.specialScheduleId = specialScheduleId;
    this.gymId = gymId;
    this.deletedBy = deletedBy;
  }
}

module.exports = {
  CreateGymScheduleCommand,
  UpdateGymScheduleCommand,
  DeleteGymScheduleCommand,
  CreateGymSpecialScheduleCommand,
  UpdateGymSpecialScheduleCommand,
  DeleteGymSpecialScheduleCommand,
};
