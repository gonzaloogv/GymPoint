/**
 * Queries para Frequency (Frecuencia semanal)
 * Representan intenciones de lectura del estado del dominio de frecuencia.
 */

class GetUserFrequencyQuery {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

class GetFrequencyByIdQuery {
  constructor({ idFrequency }) {
    this.idFrequency = idFrequency;
  }
}

class ListFrequencyHistoryQuery {
  constructor({
    idUserProfile,
    page = 1,
    limit = 20,
    startDate = null,
    endDate = null
  }) {
    this.idUserProfile = idUserProfile;
    this.page = page;
    this.limit = limit;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

class GetFrequencyStatsQuery {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

module.exports = {
  GetUserFrequencyQuery,
  GetFrequencyByIdQuery,
  ListFrequencyHistoryQuery,
  GetFrequencyStatsQuery
};
