/**
 * Routine Queries - Lote 7
 * Query objects for Routine read operations
 */

class GetRoutineWithExercisesQuery {
  constructor({ idRoutine }) {
    this.idRoutine = idRoutine;
  }
}

class GetRoutineByIdQuery {
  constructor({ idRoutine }) {
    this.idRoutine = idRoutine;
  }
}

class ListRoutinesByUserQuery {
  constructor({ idUser, isTemplate = false, page = 1, limit = 20 }) {
    this.idUser = idUser;
    this.isTemplate = isTemplate;
    this.page = page;
    this.limit = limit;
  }
}

class ListRoutineDaysQuery {
  constructor({ idRoutine }) {
    this.idRoutine = idRoutine;
  }
}

class GetRoutineDayByIdQuery {
  constructor({ idRoutineDay }) {
    this.idRoutineDay = idRoutineDay;
  }
}

class ListRoutineTemplatesQuery {
  constructor({ page = 1, limit = 20, sortBy = 'routine_name', order = 'ASC' }) {
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
  }
}

class GetRoutineExercisesQuery {
  constructor({ idRoutine, idRoutineDay = null }) {
    this.idRoutine = idRoutine;
    this.idRoutineDay = idRoutineDay; // filter by day if provided
  }
}

module.exports = {
  GetRoutineWithExercisesQuery,
  GetRoutineByIdQuery,
  ListRoutinesByUserQuery,
  ListRoutineDaysQuery,
  GetRoutineDayByIdQuery,
  ListRoutineTemplatesQuery,
  GetRoutineExercisesQuery
};
