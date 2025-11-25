/**
 * Commands para Streaks (Rachas)
 * Representan intenciones de modificación del estado del dominio de rachas.
 */

class UseRecoveryItemCommand {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

class UpdateStreakCommand {
  constructor({
    idStreak,
    value,
    lastValue,
    maxValue,
    recoveryItems,
    lastAssistanceDate
  }) {
    this.idStreak = idStreak;
    this.value = value;
    this.lastValue = lastValue;
    this.maxValue = maxValue;
    this.recoveryItems = recoveryItems;
    this.lastAssistanceDate = lastAssistanceDate;
  }
}

class ResetStreakCommand {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

module.exports = {
  UseRecoveryItemCommand,
  UpdateStreakCommand,
  ResetStreakCommand
};
