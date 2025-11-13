/**
 * Queries para Streaks (Rachas)
 * Representan intenciones de lectura del estado del dominio de rachas.
 */

class GetUserStreakQuery {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

class GetStreakByIdQuery {
  constructor({ idStreak }) {
    this.idStreak = idStreak;
  }
}

class GetStreakStatsQuery {
  constructor() {
    // Stats globales, no necesita parámetros
  }
}

class ListTopStreaksQuery {
  constructor({ limit = 10 }) {
    this.limit = limit;
  }
}

module.exports = {
  GetUserStreakQuery,
  GetStreakByIdQuery,
  GetStreakStatsQuery,
  ListTopStreaksQuery
};
