/**
 * Mappers para el dominio Gym Schedules (Horarios)
 *
 * Transforman entre DTOs (API) ↔ Commands/Queries ↔ Entidades (dominio)
 *
 * Flujo:
 * - Request: RequestDTO → Command/Query (toXCommand/toXQuery)
 * - Response: Entity/POJO → ResponseDTO (toXResponse)
 */

const {
  CreateGymScheduleCommand,
  UpdateGymScheduleCommand,
  DeleteGymScheduleCommand,
  CreateGymSpecialScheduleCommand,
  UpdateGymSpecialScheduleCommand,
  DeleteGymSpecialScheduleCommand,
} = require('../commands/gym-schedule.commands');

const {
  GetGymSchedulesQuery,
  GetGymScheduleByIdQuery,
  GetGymScheduleByDayQuery,
  ListGymSpecialSchedulesQuery,
  GetGymSpecialScheduleByIdQuery,
  GetGymSpecialScheduleByDateQuery,
  GetEffectiveGymScheduleQuery,
} = require('../queries/gym-schedule.queries');

// ============================================================================
// RequestDTO → Command
// ============================================================================

/**
 * Mapea CreateGymScheduleRequestDTO a CreateGymScheduleCommand
 */
function toCreateGymScheduleCommand(dto, gymId, createdBy) {
  return new CreateGymScheduleCommand({
    gymId,
    day_of_week: dto.day_of_week,
    open_time: dto.open_time,
    close_time: dto.close_time,
    is_closed: dto.is_closed !== undefined ? dto.is_closed : false,
    createdBy,
  });
}

/**
 * Mapea UpdateGymScheduleRequestDTO a UpdateGymScheduleCommand
 */
function toUpdateGymScheduleCommand(dto, scheduleId, gymId, updatedBy) {
  return new UpdateGymScheduleCommand({
    scheduleId,
    gymId,
    open_time: dto.open_time,
    close_time: dto.close_time,
    is_closed: dto.is_closed,
    updatedBy,
  });
}

/**
 * Mapea a DeleteGymScheduleCommand
 */
function toDeleteGymScheduleCommand(scheduleId, gymId, deletedBy) {
  return new DeleteGymScheduleCommand({ scheduleId, gymId, deletedBy });
}

/**
 * Mapea CreateGymSpecialScheduleRequestDTO a CreateGymSpecialScheduleCommand
 */
function toCreateGymSpecialScheduleCommand(dto, gymId, createdBy) {
  return new CreateGymSpecialScheduleCommand({
    gymId,
    date: dto.date ? new Date(dto.date) : new Date(dto.special_date), // Soporte para ambos nombres
    open_time: dto.open_time || null,
    close_time: dto.close_time || null,
    is_closed: dto.is_closed !== undefined ? dto.is_closed : false,
    reason: dto.reason || dto.motive || null, // Soporte para ambos nombres
    createdBy,
  });
}

/**
 * Mapea UpdateGymSpecialScheduleRequestDTO a UpdateGymSpecialScheduleCommand
 */
function toUpdateGymSpecialScheduleCommand(dto, specialScheduleId, gymId, updatedBy) {
  return new UpdateGymSpecialScheduleCommand({
    specialScheduleId,
    gymId,
    open_time: dto.open_time,
    close_time: dto.close_time,
    is_closed: dto.is_closed,
    reason: dto.reason || dto.motive, // Soporte para ambos nombres
    updatedBy,
  });
}

/**
 * Mapea a DeleteGymSpecialScheduleCommand
 */
function toDeleteGymSpecialScheduleCommand(specialScheduleId, gymId, deletedBy) {
  return new DeleteGymSpecialScheduleCommand({ specialScheduleId, gymId, deletedBy });
}

// ============================================================================
// RequestDTO → Query
// ============================================================================

/**
 * Mapea a GetGymSchedulesQuery
 */
function toGetGymSchedulesQuery(gymId) {
  return new GetGymSchedulesQuery({ gymId });
}

/**
 * Mapea a GetGymScheduleByIdQuery
 */
function toGetGymScheduleByIdQuery(scheduleId, gymId) {
  return new GetGymScheduleByIdQuery({ scheduleId, gymId });
}

/**
 * Mapea a GetGymScheduleByDayQuery
 */
function toGetGymScheduleByDayQuery(gymId, day_of_week) {
  return new GetGymScheduleByDayQuery({ gymId, day_of_week: parseInt(day_of_week) });
}

/**
 * Mapea query params a ListGymSpecialSchedulesQuery
 */
function toListGymSpecialSchedulesQuery(gymId, queryParams = {}) {
  return new ListGymSpecialSchedulesQuery({
    gymId,
    from_date: queryParams.from_date ? new Date(queryParams.from_date) : null,
    to_date: queryParams.to_date ? new Date(queryParams.to_date) : null,
    future_only: queryParams.future_only !== 'false',
  });
}

/**
 * Mapea a GetGymSpecialScheduleByIdQuery
 */
function toGetGymSpecialScheduleByIdQuery(specialScheduleId, gymId) {
  return new GetGymSpecialScheduleByIdQuery({ specialScheduleId, gymId });
}

/**
 * Mapea a GetGymSpecialScheduleByDateQuery
 */
function toGetGymSpecialScheduleByDateQuery(gymId, date) {
  return new GetGymSpecialScheduleByDateQuery({
    gymId,
    date: new Date(date),
  });
}

/**
 * Mapea a GetEffectiveGymScheduleQuery
 */
function toGetEffectiveGymScheduleQuery(gymId, date) {
  return new GetEffectiveGymScheduleQuery({
    gymId,
    date: new Date(date),
  });
}

// ============================================================================
// Entity → ResponseDTO
// ============================================================================

/**
 * Mapea entidad GymSchedule a GymScheduleResponseDTO
 */
function toGymScheduleResponse(schedule) {
  return {
    id_schedule: schedule.id_schedule,
    id_gym: schedule.id_gym,
    day_of_week: schedule.day_of_week,
    open_time: schedule.open_time,
    close_time: schedule.close_time,
    is_closed: schedule.is_closed,
  };
}

/**
 * Mapea array de schedules a array de DTOs
 */
function toGymSchedulesDTO(schedules) {
  return schedules.map(schedule => toGymScheduleResponse(schedule));
}

/**
 * Mapea array de schedules a response agrupado por día
 */
function toGymSchedulesWeekResponse(schedules) {
  const week = {
    0: null, // Domingo
    1: null, // Lunes
    2: null, // Martes
    3: null, // Miércoles
    4: null, // Jueves
    5: null, // Viernes
    6: null, // Sábado
  };

  schedules.forEach(schedule => {
    week[schedule.day_of_week] = toGymScheduleResponse(schedule);
  });

  return week;
}

/**
 * Mapea entidad GymSpecialSchedule a GymSpecialScheduleResponseDTO
 */
function toGymSpecialScheduleResponse(specialSchedule) {
  return {
    id_special_schedule: specialSchedule.id_special_schedule,
    id_gym: specialSchedule.id_gym,
    date: specialSchedule.date, // Usar 'date' como está en el modelo
    open_time: specialSchedule.open_time,
    close_time: specialSchedule.close_time,
    is_closed: specialSchedule.is_closed,
    motive: specialSchedule.reason || null,
    created_at: specialSchedule.created_at ? specialSchedule.created_at.toISOString() : null,
    updated_at: specialSchedule.updated_at ? specialSchedule.updated_at.toISOString() : null,
  };
}

/**
 * Mapea un special schedule a DTO (alias para consistencia)
 */
function toGymSpecialScheduleDTO(specialSchedule) {
  return toGymSpecialScheduleResponse(specialSchedule);
}

/**
 * Mapea array de special schedules a array de DTOs
 */
function toGymSpecialSchedulesDTO(specialSchedules) {
  return specialSchedules.map(schedule => toGymSpecialScheduleResponse(schedule));
}

/**
 * Mapea un schedule a DTO (alias para consistencia)
 */
function toGymScheduleDTO(schedule) {
  return toGymScheduleResponse(schedule);
}

module.exports = {
  // RequestDTO → Command
  toCreateGymScheduleCommand,
  toUpdateGymScheduleCommand,
  toDeleteGymScheduleCommand,
  toCreateGymSpecialScheduleCommand,
  toUpdateGymSpecialScheduleCommand,
  toDeleteGymSpecialScheduleCommand,

  // RequestDTO → Query
  toGetGymSchedulesQuery,
  toGetGymScheduleByIdQuery,
  toGetGymScheduleByDayQuery,
  toListGymSpecialSchedulesQuery,
  toGetGymSpecialScheduleByIdQuery,
  toGetGymSpecialScheduleByDateQuery,
  toGetEffectiveGymScheduleQuery,

  // Entity → ResponseDTO
  toGymScheduleResponse,
  toGymScheduleDTO,
  toGymSchedulesDTO,
  toGymSchedulesWeekResponse,
  toGymSpecialScheduleResponse,
  toGymSpecialScheduleDTO,
  toGymSpecialSchedulesDTO,
};
