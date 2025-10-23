/**
 * UserRoutine Queries - Lote 7
 * Query objects for UserRoutine read operations
 */

class GetActiveUserRoutineQuery {
  constructor({ idUser }) {
    this.idUser = idUser;
  }
}

class GetActiveRoutineWithExercisesQuery {
  constructor({ idUser }) {
    this.idUser = idUser;
  }
}

class ListUserRoutinesQuery {
  constructor({ idUser, active = null, page = 1, limit = 20 }) {
    this.idUser = idUser;
    this.active = active; // filter by active status (true/false/null for all)
    this.page = page;
    this.limit = limit;
  }
}

class GetUserRoutineByIdQuery {
  constructor({ idUserRoutine }) {
    this.idUserRoutine = idUserRoutine;
  }
}

class GetUserRoutineCountsQuery {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

module.exports = {
  GetActiveUserRoutineQuery,
  GetActiveRoutineWithExercisesQuery,
  ListUserRoutinesQuery,
  GetUserRoutineByIdQuery,
  GetUserRoutineCountsQuery
};
