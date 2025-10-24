/**
 * Mappers para Assistance
 * Transformaciones bidireccionales entre DTOs, Commands/Queries y Entidades
 */

const {
  CreateAssistanceCommand,
  CheckOutCommand,
  RegisterPresenceCommand,
  VerifyAutoCheckInCommand
} = require('../commands/assistance.commands');

const {
  ListAssistancesQuery,
  GetAssistanceByIdQuery,
  CheckExistingAssistanceQuery,
  GetAssistanceStatsQuery
} = require('../queries/assistance.queries');

// ========================================
// DTO → Command/Query
// ========================================

/**
 * Transforma CheckInRequest DTO a CreateAssistanceCommand
 */
function toCreateAssistanceCommand(dto, userProfileId) {
  return new CreateAssistanceCommand({
    userProfileId,
    gymId: dto.id_gym || dto.gymId,
    latitude: dto.latitude,
    longitude: dto.longitude,
    accuracy: dto.accuracy,
    autoCheckin: dto.auto_checkin || dto.autoCheckin || false,
    distanceMeters: dto.distance_meters || dto.distanceMeters,
    verified: dto.verified || false
  });
}

/**
 * Transforma DTO a CheckOutCommand
 */
function toCheckOutCommand(assistanceId, userProfileId) {
  return new CheckOutCommand({
    assistanceId,
    userProfileId
  });
}

/**
 * Transforma PresenceRequest DTO a RegisterPresenceCommand
 */
function toRegisterPresenceCommand(dto, userProfileId) {
  return new RegisterPresenceCommand({
    userProfileId,
    gymId: dto.id_gym || dto.gymId,
    latitude: dto.latitude,
    longitude: dto.longitude,
    accuracy: dto.accuracy
  });
}

/**
 * Transforma DTO a VerifyAutoCheckInCommand
 */
function toVerifyAutoCheckInCommand(dto, userProfileId) {
  return new VerifyAutoCheckInCommand({
    userProfileId,
    gymId: dto.id_gym || dto.gymId
  });
}

/**
 * Transforma query params a ListAssistancesQuery
 */
function toListAssistancesQuery(params, userProfileId) {
  return new ListAssistancesQuery({
    userProfileId,
    gymId: params.gymId || params.id_gym,
    startDate: params.startDate || params.start_date,
    endDate: params.endDate || params.end_date,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: params.limit ? parseInt(params.limit, 10) : 20,
    includeGymDetails: params.includeGymDetails !== 'false'
  });
}

/**
 * Transforma params a GetAssistanceByIdQuery
 */
function toGetAssistanceByIdQuery(assistanceId, userProfileId = null, includeGymDetails = false) {
  return new GetAssistanceByIdQuery({
    assistanceId,
    userProfileId,
    includeGymDetails
  });
}

// ========================================
// Entidad → DTO
// ========================================

/**
 * Transforma entidad Assistance a AssistanceResponse DTO
 */
function toAssistanceDTO(assistance) {
  if (!assistance) return null;

  return {
    id_assistance: assistance.id_assistance,
    id_user_profile: assistance.id_user_profile,
    id_gym: assistance.id_gym,
    date: assistance.date,
    check_in_time: assistance.check_in_time,
    check_out_time: assistance.check_out_time,
    duration_minutes: assistance.duration_minutes,
    auto_checkin: assistance.auto_checkin,
    distance_meters: assistance.distance_meters ? parseFloat(assistance.distance_meters) : null,
    verified: assistance.verified,
    created_at: assistance.created_at ? assistance.created_at.toISOString() : null,
    // Include gym if present
    ...(assistance.gym && {
      gym: {
        name: assistance.gym.name,
        city: assistance.gym.city,
        address: assistance.gym.address
      }
    })
  };
}

/**
 * Transforma array de asistencias a DTOs
 */
function toAssistancesDTO(assistances) {
  if (!Array.isArray(assistances)) return [];
  return assistances.map(toAssistanceDTO);
}

/**
 * Transforma resultado de check-in a CheckInResponseData DTO
 */
function toCheckInResponseDTO(result) {
  return {
    asistencia: toAssistanceDTO(result.asistencia),
    distancia: result.distancia || Math.round(result.distance_meters || 0),
    tokens_actuales: result.tokens_actuales || result.newBalance,
    racha_actual: result.racha_actual
  };
}

/**
 * Transforma resultado de checkout a CheckOutResponse DTO
 */
function toCheckOutResponseDTO(result) {
  return {
    asistencia: toAssistanceDTO(result.asistencia),
    duration_minutes: result.duration_minutes,
    tokens_awarded: result.tokens_awarded || 0,
    tokens_total: result.tokens_total || result.newBalance
  };
}

/**
 * Transforma resultado de presencia a PresenceResponse DTO
 */
function toPresenceResponseDTO(result) {
  return {
    duracion_minutos: result.duracion_minutos,
    min_stay_minutes: result.min_stay_minutes,
    listo_para_checkin: result.listo_para_checkin,
    progreso: result.progreso || `${result.duracion_minutos}/${result.min_stay_minutes} min`
  };
}

/**
 * Transforma lista de asistencias a AssistanceHistoryResponse DTO
 */
function toAssistanceHistoryDTO(assistances) {
  return {
    message: 'Historial de asistencias obtenido con éxito',
    data: toAssistancesDTO(assistances)
  };
}

/**
 * Transforma resultado paginado de asistencias
 */
function toPaginatedAssistancesDTO(result) {
  return {
    items: toAssistancesDTO(result.items || result.rows || []),
    total: result.total || result.count || 0,
    page: result.page || 1,
    limit: result.limit || 20,
    totalPages: result.totalPages || Math.ceil((result.total || result.count || 0) / (result.limit || 20))
  };
}

module.exports = {
  // DTO → Command/Query
  toCreateAssistanceCommand,
  toCheckOutCommand,
  toRegisterPresenceCommand,
  toVerifyAutoCheckInCommand,
  toListAssistancesQuery,
  toGetAssistanceByIdQuery,

  // Entidad → DTO
  toAssistanceDTO,
  toAssistancesDTO,
  toCheckInResponseDTO,
  toCheckOutResponseDTO,
  toPresenceResponseDTO,
  toAssistanceHistoryDTO,
  toPaginatedAssistancesDTO
};
