/**
 * Commands para Frequency (Frecuencia semanal)
 * Representan intenciones de modificación del estado del dominio de frecuencia.
 */

class CreateWeeklyGoalCommand {
  constructor({ idUserProfile, goal }) {
    this.idUserProfile = idUserProfile;
    this.goal = goal;
  }
}

class UpdateWeeklyGoalCommand {
  constructor({ idUserProfile, goal }) {
    this.idUserProfile = idUserProfile;
    this.goal = goal;
  }
}

class IncrementAssistanceCommand {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

class ResetWeekCommand {
  constructor({ idFrequency }) {
    this.idFrequency = idFrequency;
  }
}

module.exports = {
  CreateWeeklyGoalCommand,
  UpdateWeeklyGoalCommand,
  IncrementAssistanceCommand,
  ResetWeekCommand
};
