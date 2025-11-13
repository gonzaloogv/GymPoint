/**
 * Routine Commands - Lote 7
 * Command objects for Routine write operations
 */

class CreateRoutineCommand {
  constructor({ routineName, description, createdBy, isTemplate = false }) {
    this.routineName = routineName;
    this.description = description;
    this.createdBy = createdBy;
    this.isTemplate = isTemplate;
  }
}

class CreateRoutineWithExercisesCommand {
  constructor({ routineName, description, exercises, idUser, days = [] }) {
    this.routineName = routineName;
    this.description = description;
    this.exercises = exercises; // array of { id_exercise, series, reps, order, day_number }
    this.idUser = idUser;
    this.days = days; // array of { day_number, title, description }
  }
}

class UpdateRoutineCommand {
  constructor({ idRoutine, routineName, description }) {
    this.idRoutine = idRoutine;
    this.routineName = routineName;
    this.description = description;
  }
}

class DeleteRoutineCommand {
  constructor({ idRoutine }) {
    this.idRoutine = idRoutine;
  }
}

class AddExerciseToRoutineCommand {
  constructor({ idRoutine, idExercise, series, reps, order, idRoutineDay = null }) {
    this.idRoutine = idRoutine;
    this.idExercise = idExercise;
    this.series = series;
    this.reps = reps;
    this.order = order;
    this.idRoutineDay = idRoutineDay;
  }
}

class UpdateRoutineExerciseCommand {
  constructor({ idRoutine, idExercise, series, reps, order, idRoutineDay }) {
    this.idRoutine = idRoutine;
    this.idExercise = idExercise;
    this.series = series;
    this.reps = reps;
    this.order = order;
    this.idRoutineDay = idRoutineDay;
  }
}

class DeleteRoutineExerciseCommand {
  constructor({ idRoutine, idExercise }) {
    this.idRoutine = idRoutine;
    this.idExercise = idExercise;
  }
}

class CreateRoutineDayCommand {
  constructor({ idRoutine, dayNumber, title, description }) {
    this.idRoutine = idRoutine;
    this.dayNumber = dayNumber;
    this.title = title;
    this.description = description;
  }
}

class UpdateRoutineDayCommand {
  constructor({ idRoutineDay, dayNumber, title, description }) {
    this.idRoutineDay = idRoutineDay;
    this.dayNumber = dayNumber;
    this.title = title;
    this.description = description;
  }
}

class DeleteRoutineDayCommand {
  constructor({ idRoutineDay }) {
    this.idRoutineDay = idRoutineDay;
  }
}

module.exports = {
  CreateRoutineCommand,
  CreateRoutineWithExercisesCommand,
  UpdateRoutineCommand,
  DeleteRoutineCommand,
  AddExerciseToRoutineCommand,
  UpdateRoutineExerciseCommand,
  DeleteRoutineExerciseCommand,
  CreateRoutineDayCommand,
  UpdateRoutineDayCommand,
  DeleteRoutineDayCommand
};
