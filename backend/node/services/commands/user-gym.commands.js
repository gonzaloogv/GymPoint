/**
 * UserGym Commands - Lote 9
 * Comandos para operaciones de escritura en suscripciones de gimnasios
 */

// ============================================================================
// USER GYM COMMANDS
// ============================================================================

/**
 * SubscribeToGymCommand
 * Suscribe un usuario a un gimnasio
 */
class SubscribeToGymCommand {
  constructor({
    userProfileId,
    gymId,
    subscriptionPlan = 'MONTHLY',
    subscriptionStart = null,
    subscriptionEnd = null,
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
    this.subscriptionPlan = subscriptionPlan;
    this.subscriptionStart = subscriptionStart;
    this.subscriptionEnd = subscriptionEnd;
  }
}

/**
 * UnsubscribeFromGymCommand
 * Desuscribe un usuario de un gimnasio
 */
class UnsubscribeFromGymCommand {
  constructor({
    userProfileId,
    gymId,
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
  }
}

/**
 * UpdateSubscriptionCommand
 * Actualiza una suscripción existente
 */
class UpdateSubscriptionCommand {
  constructor({
    userGymId,
    subscriptionPlan = null,
    subscriptionEnd = null,
    isActive = null,
  }) {
    this.userGymId = userGymId;
    this.subscriptionPlan = subscriptionPlan;
    this.subscriptionEnd = subscriptionEnd;
    this.isActive = isActive;
  }
}

/**
 * RenewSubscriptionCommand
 * Renueva una suscripción de gimnasio
 */
class RenewSubscriptionCommand {
  constructor({
    userGymId,
    subscriptionPlan = null,
  }) {
    this.userGymId = userGymId;
    this.subscriptionPlan = subscriptionPlan;
  }
}

module.exports = {
  SubscribeToGymCommand,
  UnsubscribeFromGymCommand,
  UpdateSubscriptionCommand,
  RenewSubscriptionCommand,
};
