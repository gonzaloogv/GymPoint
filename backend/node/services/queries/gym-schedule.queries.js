/**
 * Queries para el dominio Gym Schedules (Horarios)
 *
 * Las Queries son objetos puros (POJOs) que representan una solicitud
 * de lectura de datos. No modifican el estado del sistema.
 *
 * Cobertura:
 * - GymSchedule: Horarios regulares semanales
 * - GymSpecialSchedule: Horarios especiales (feriados, cierres)
 */

/**
 * Query para obtener horarios regulares de un gimnasio
 *
 * @typedef {Object} GetGymSchedulesQuery
 * @property {number} gymId - ID del gimnasio
 */
class GetGymSchedulesQuery {
  constructor({ gymId }) {
    this.gymId = gymId;
  }
}

/**
 * Query para obtener un horario específico por ID
 *
 * @typedef {Object} GetGymScheduleByIdQuery
 * @property {number} scheduleId - ID del horario
 * @property {number} gymId - ID del gimnasio (para validación)
 */
class GetGymScheduleByIdQuery {
  constructor({ scheduleId, gymId }) {
    this.scheduleId = scheduleId;
    this.gymId = gymId;
  }
}

/**
 * Query para obtener horario de un día específico de la semana
 *
 * @typedef {Object} GetGymScheduleByDayQuery
 * @property {number} gymId - ID del gimnasio
 * @property {number} day_of_week - Día de la semana (0-6)
 */
class GetGymScheduleByDayQuery {
  constructor({ gymId, day_of_week }) {
    this.gymId = gymId;
    this.day_of_week = day_of_week;
  }
}

/**
 * Query para obtener horarios especiales de un gimnasio
 *
 * @typedef {Object} ListGymSpecialSchedulesQuery
 * @property {number} gymId - ID del gimnasio
 * @property {Date} [from_date] - Fecha desde (opcional)
 * @property {Date} [to_date] - Fecha hasta (opcional)
 * @property {boolean} [future_only=true] - Solo fechas futuras
 */
class ListGymSpecialSchedulesQuery {
  constructor({
    gymId,
    from_date = null,
    to_date = null,
    future_only = true,
  }) {
    this.gymId = gymId;
    this.from_date = from_date;
    this.to_date = to_date;
    this.future_only = future_only;
  }
}

/**
 * Query para obtener un horario especial por ID
 *
 * @typedef {Object} GetGymSpecialScheduleByIdQuery
 * @property {number} specialScheduleId - ID del horario especial
 * @property {number} gymId - ID del gimnasio (para validación)
 */
class GetGymSpecialScheduleByIdQuery {
  constructor({ specialScheduleId, gymId }) {
    this.specialScheduleId = specialScheduleId;
    this.gymId = gymId;
  }
}

/**
 * Query para obtener horario especial de una fecha específica
 *
 * @typedef {Object} GetGymSpecialScheduleByDateQuery
 * @property {number} gymId - ID del gimnasio
 * @property {Date} special_date - Fecha específica
 */
class GetGymSpecialScheduleByDateQuery {
  constructor({ gymId, date }) {
    this.gymId = gymId;
    this.date = date;
  }
}

/**
 * Query para obtener horario efectivo de un gym en una fecha específica
 * (combina horario regular con horario especial si existe)
 *
 * @typedef {Object} GetEffectiveGymScheduleQuery
 * @property {number} gymId - ID del gimnasio
 * @property {Date} date - Fecha para consultar
 */
class GetEffectiveGymScheduleQuery {
  constructor({ gymId, date }) {
    this.gymId = gymId;
    this.date = date;
  }
}

module.exports = {
  GetGymSchedulesQuery,
  GetGymScheduleByIdQuery,
  GetGymScheduleByDayQuery,
  ListGymSpecialSchedulesQuery,
  GetGymSpecialScheduleByIdQuery,
  GetGymSpecialScheduleByDateQuery,
  GetEffectiveGymScheduleQuery,
};
