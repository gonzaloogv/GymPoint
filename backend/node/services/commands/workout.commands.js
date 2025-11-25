/**
 * Workout Commands - Lote 7
 * Command objects for Workout write operations
 */

class StartWorkoutSessionCommand {
  constructor({ idUserProfile, idRoutine = null, idRoutineDay = null, startedAt = new Date(), notes = null }) {
    this.idUserProfile = idUserProfile;
    this.idRoutine = idRoutine;
    this.idRoutineDay = idRoutineDay;
    this.startedAt = startedAt;
    this.notes = notes;
  }
}

class RegisterWorkoutSetCommand {
  constructor({ idWorkoutSession, idExercise, weight = null, reps = null, rpe = null, restSeconds = null, isWarmup = false, notes = null, performedAt = new Date() }) {
    this.idWorkoutSession = idWorkoutSession;
    this.idExercise = idExercise;
    this.weight = weight;
    this.reps = reps;
    this.rpe = rpe;
    this.restSeconds = restSeconds;
    this.isWarmup = isWarmup;
    this.notes = notes;
    this.performedAt = performedAt;
  }
}

class UpdateWorkoutSetCommand {
  constructor({ idWorkoutSet, weight, reps, rpe, restSeconds, isWarmup, notes }) {
    this.idWorkoutSet = idWorkoutSet;
    this.weight = weight;
    this.reps = reps;
    this.rpe = rpe;
    this.restSeconds = restSeconds;
    this.isWarmup = isWarmup;
    this.notes = notes;
  }
}

class DeleteWorkoutSetCommand {
  constructor({ idWorkoutSet }) {
    this.idWorkoutSet = idWorkoutSet;
  }
}

class FinishWorkoutSessionCommand {
  constructor({ idWorkoutSession, finishedAt = new Date(), notes = null }) {
    this.idWorkoutSession = idWorkoutSession;
    this.finishedAt = finishedAt;
    this.notes = notes;
  }
}

class CancelWorkoutSessionCommand {
  constructor({ idWorkoutSession }) {
    this.idWorkoutSession = idWorkoutSession;
  }
}

class UpdateWorkoutSessionCommand {
  constructor({ idWorkoutSession, notes }) {
    this.idWorkoutSession = idWorkoutSession;
    this.notes = notes;
  }
}

module.exports = {
  StartWorkoutSessionCommand,
  RegisterWorkoutSetCommand,
  UpdateWorkoutSetCommand,
  DeleteWorkoutSetCommand,
  FinishWorkoutSessionCommand,
  CancelWorkoutSessionCommand,
  UpdateWorkoutSessionCommand
};
