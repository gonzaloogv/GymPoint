/**
 * Queries para Assistance
 * Queries son read operations (listar, obtener)
 */

/**
 * Query para listar asistencias de un usuario
 */
class ListAssistancesQuery {
  constructor({
    userProfileId,
    gymId = null,
    startDate = null,
    endDate = null,
    page = 1,
    limit = 20,
    includeGymDetails = true
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.page = page;
    this.limit = limit;
    this.includeGymDetails = includeGymDetails;
  }
}

/**
 * Query para obtener una asistencia por ID
 */
class GetAssistanceByIdQuery {
  constructor({ assistanceId, userProfileId = null, includeGymDetails = false }) {
    this.assistanceId = assistanceId;
    this.userProfileId = userProfileId;
    this.includeGymDetails = includeGymDetails;
  }
}

/**
 * Query para verificar si ya existe asistencia en una fecha
 */
class CheckExistingAssistanceQuery {
  constructor({ userProfileId, gymId, date }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
    this.date = date;
  }
}

/**
 * Query para obtener estadísticas de asistencia de un usuario
 */
class GetAssistanceStatsQuery {
  constructor({ userProfileId, startDate = null, endDate = null }) {
    this.userProfileId = userProfileId;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

module.exports = {
  ListAssistancesQuery,
  GetAssistanceByIdQuery,
  CheckExistingAssistanceQuery,
  GetAssistanceStatsQuery
};
