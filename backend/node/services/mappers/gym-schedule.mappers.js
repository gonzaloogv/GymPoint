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
    special_date: new Date(dto.special_date),
    open_time: dto.open_time || null,
    close_time: dto.close_time || null,
    is_closed: dto.is_closed !== undefined ? dto.is_closed : false,
    reason: dto.reason || null,
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
    reason: dto.reason,
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
function toGetGymSpecialScheduleByDateQuery(gymId, special_date) {
  return new GetGymSpecialScheduleByDateQuery({
    gymId,
    special_date: new Date(special_date),
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
    special_date: specialSchedule.special_date,
    open_time: specialSchedule.open_time,
    close_time: specialSchedule.close_time,
    is_closed: specialSchedule.is_closed,
    reason: specialSchedule.reason || null,
    created_at: specialSchedule.created_at ? specialSchedule.created_at.toISOString() : null,
  };
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
  toGymSchedulesWeekResponse,
  toGymSpecialScheduleResponse,
};
