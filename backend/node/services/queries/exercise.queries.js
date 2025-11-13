/**
 * Exercise Queries - Lote 7
 * Query objects for Exercise read operations
 */

class GetAllExercisesQuery {
  constructor({ filters = {}, pagination = {}, sort = {} }) {
    this.filters = filters; // { muscularGroup, difficulty, equipmentNeeded }
    this.pagination = pagination; // { limit, offset }
    this.sort = sort; // { field, order }
  }
}

class GetExerciseByIdQuery {
  constructor({ idExercise }) {
    this.idExercise = idExercise;
  }
}

class ListExercisesQuery {
  constructor({ muscularGroup, difficulty, equipmentNeeded, page = 1, limit = 20, sortBy = 'exercise_name', order = 'ASC' }) {
    this.muscularGroup = muscularGroup;
    this.difficulty = difficulty;
    this.equipmentNeeded = equipmentNeeded;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
  }
}

module.exports = {
  GetAllExercisesQuery,
  GetExerciseByIdQuery,
  ListExercisesQuery
};
