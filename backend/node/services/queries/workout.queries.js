/**
 * Workout Queries - Lote 7
 * Query objects for Workout read operations
 */

class GetWorkoutSessionQuery {
  constructor({ idWorkoutSession, includeSets = false }) {
    this.idWorkoutSession = idWorkoutSession;
    this.includeSets = includeSets;
  }
}

class ListWorkoutSessionsQuery {
  constructor({ idUserProfile, idRoutine = null, status = null, startDate = null, endDate = null, page = 1, limit = 20 }) {
    this.idUserProfile = idUserProfile;
    this.idRoutine = idRoutine; // Filter by routine if provided
    this.status = status; // 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    this.startDate = startDate;
    this.endDate = endDate;
    this.page = page;
    this.limit = limit;
  }
}

class GetWorkoutSetQuery {
  constructor({ idWorkoutSet }) {
    this.idWorkoutSet = idWorkoutSet;
  }
}

class ListWorkoutSetsQuery {
  constructor({ idWorkoutSession, idExercise = null }) {
    this.idWorkoutSession = idWorkoutSession;
    this.idExercise = idExercise; // filter by exercise if provided
  }
}

class GetWorkoutStatsQuery {
  constructor({ idUserProfile, startDate = null, endDate = null }) {
    this.idUserProfile = idUserProfile;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

class GetActiveWorkoutSessionQuery {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

class GetWorkoutSessionWithSetsQuery {
  constructor({ idWorkoutSession }) {
    this.idWorkoutSession = idWorkoutSession;
  }
}

class GetLastSetsForExercisesQuery {
  constructor({ idUserProfile, exerciseIds }) {
    this.idUserProfile = idUserProfile;
    this.exerciseIds = exerciseIds; // Array de IDs de ejercicios
  }
}

module.exports = {
  GetWorkoutSessionQuery,
  ListWorkoutSessionsQuery,
  GetWorkoutSetQuery,
  ListWorkoutSetsQuery,
  GetWorkoutStatsQuery,
  GetActiveWorkoutSessionQuery,
  GetWorkoutSessionWithSetsQuery,
  GetLastSetsForExercisesQuery
};
