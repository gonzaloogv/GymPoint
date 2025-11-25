/**
 * UserRoutine Commands - Lote 7
 * Command objects for UserRoutine write operations
 */

class AssignRoutineToUserCommand {
  constructor({ idUser, idRoutine, startDate }) {
    this.idUser = idUser;
    this.idRoutine = idRoutine;
    this.startDate = startDate;
  }
}

class EndUserRoutineCommand {
  constructor({ idUser, finishDate = new Date() }) {
    this.idUser = idUser;
    this.finishDate = finishDate;
  }
}

class ImportRoutineCommand {
  constructor({ idUserProfile, idTemplateRoutine }) {
    this.idUserProfile = idUserProfile;
    this.idTemplateRoutine = idTemplateRoutine;
  }
}

class DeactivateUserRoutineCommand {
  constructor({ idUserRoutine }) {
    this.idUserRoutine = idUserRoutine;
  }
}

module.exports = {
  AssignRoutineToUserCommand,
  EndUserRoutineCommand,
  ImportRoutineCommand,
  DeactivateUserRoutineCommand
};
