/**
 * Commands para el dominio Users & Profiles
 *
 * Los Commands son objetos puros (POJOs) que representan una intención
 * de modificar el estado del sistema. No contienen lógica de negocio.
 *
 * Basado en: backend/plan/codex_prompt_openapi_refactor.md
 * - Lote 2: UserProfile, Presence, UserNotificationSetting
 */

/**
 * Command para actualizar perfil de usuario
 *
 * @typedef {Object} UpdateUserProfileCommand
 * @property {number} userProfileId - ID del user_profile
 * @property {string} [name] - Nombre del usuario
 * @property {string} [lastname] - Apellido del usuario
 * @property {string} [gender] - Género (M, F, O)
 * @property {string|null} [birthDate] - Fecha de nacimiento (YYYY-MM-DD)
 * @property {string} [locality] - Localidad del usuario
 * @property {string} [profilePictureUrl] - URL de la foto de perfil
 * @property {string} [preferredLanguage] - Idioma preferido (es, en)
 * @property {string} [timezone] - Zona horaria
 * @property {boolean} [onboardingCompleted] - Si completó el onboarding
 */
class UpdateUserProfileCommand {
  constructor({
    userProfileId,
    name,
    lastname,
    gender,
    birthDate,
    locality,
    profilePictureUrl,
    preferredLanguage,
    timezone,
    onboardingCompleted,
  }) {
    this.userProfileId = userProfileId;
    this.name = name;
    this.lastname = lastname;
    this.gender = gender;
    this.birthDate = birthDate;
    this.locality = locality;
    this.profilePictureUrl = profilePictureUrl;
    this.preferredLanguage = preferredLanguage;
    this.timezone = timezone;
    this.onboardingCompleted = onboardingCompleted;
  }
}

/**
 * Command para actualizar email de la cuenta
 *
 * @typedef {Object} UpdateEmailCommand
 * @property {number} accountId - ID de la cuenta
 * @property {string} newEmail - Nuevo email
 */
class UpdateEmailCommand {
  constructor({ accountId, newEmail }) {
    this.accountId = accountId;
    this.newEmail = newEmail;
  }
}

/**
 * Command para actualizar tokens de un usuario (solo admin)
 *
 * @typedef {Object} UpdateUserTokensCommand
 * @property {number} userProfileId - ID del user_profile
 * @property {number} delta - Cantidad de tokens a sumar o restar
 * @property {string} reason - Razón del cambio
 * @property {string} [refType] - Tipo de referencia (opcional)
 * @property {number} [refId] - ID de referencia (opcional)
 */
class UpdateUserTokensCommand {
  constructor({ userProfileId, delta, reason, refType = null, refId = null }) {
    this.userProfileId = userProfileId;
    this.delta = delta;
    this.reason = reason;
    this.refType = refType;
    this.refId = refId;
  }
}

/**
 * Command para actualizar suscripción de un usuario (solo admin)
 *
 * @typedef {Object} UpdateUserSubscriptionCommand
 * @property {number} userProfileId - ID del user_profile
 * @property {string} subscription - Tipo de suscripción (FREE, PREMIUM)
 * @property {Date} [premiumSince] - Fecha de inicio de premium
 * @property {Date} [premiumExpires] - Fecha de expiración de premium
 */
class UpdateUserSubscriptionCommand {
  constructor({ userProfileId, subscription, premiumSince = null, premiumExpires = null }) {
    this.userProfileId = userProfileId;
    this.subscription = subscription;
    this.premiumSince = premiumSince;
    this.premiumExpires = premiumExpires;
  }
}

/**
 * Command para solicitar eliminación de cuenta
 *
 * @typedef {Object} RequestAccountDeletionCommand
 * @property {number} accountId - ID de la cuenta
 * @property {string} [reason] - Razón de la eliminación
 */
class RequestAccountDeletionCommand {
  constructor({ accountId, reason = null }) {
    this.accountId = accountId;
    this.reason = reason;
  }
}

/**
 * Command para cancelar solicitud de eliminación de cuenta
 *
 * @typedef {Object} CancelAccountDeletionCommand
 * @property {number} accountId - ID de la cuenta
 */
class CancelAccountDeletionCommand {
  constructor({ accountId }) {
    this.accountId = accountId;
  }
}

/**
 * Command para actualizar configuración de notificaciones
 *
 * @typedef {Object} UpdateNotificationSettingsCommand
 * @property {number} userProfileId - ID del user_profile
 * @property {boolean} [remindersEnabled] - Notificaciones de recordatorios
 * @property {boolean} [achievementsEnabled] - Notificaciones de logros
 * @property {boolean} [rewardsEnabled] - Notificaciones de recompensas
 * @property {boolean} [gymUpdatesEnabled] - Notificaciones de actualizaciones de gym
 * @property {boolean} [paymentEnabled] - Notificaciones de pagos
 * @property {boolean} [socialEnabled] - Notificaciones sociales
 * @property {boolean} [systemEnabled] - Notificaciones del sistema
 * @property {boolean} [challengeEnabled] - Notificaciones de desafíos
 * @property {boolean} [pushEnabled] - Notificaciones push
 * @property {boolean} [emailEnabled] - Notificaciones por email
 * @property {string} [quietHoursStart] - Hora de inicio de modo silencioso (HH:MM)
 * @property {string} [quietHoursEnd] - Hora de fin de modo silencioso (HH:MM)
 */
class UpdateNotificationSettingsCommand {
  constructor({
    userProfileId,
    remindersEnabled,
    achievementsEnabled,
    rewardsEnabled,
    gymUpdatesEnabled,
    paymentEnabled,
    socialEnabled,
    systemEnabled,
    challengeEnabled,
    pushEnabled,
    emailEnabled,
    quietHoursStart,
    quietHoursEnd,
  }) {
    this.userProfileId = userProfileId;
    this.remindersEnabled = remindersEnabled;
    this.achievementsEnabled = achievementsEnabled;
    this.rewardsEnabled = rewardsEnabled;
    this.gymUpdatesEnabled = gymUpdatesEnabled;
    this.paymentEnabled = paymentEnabled;
    this.socialEnabled = socialEnabled;
    this.systemEnabled = systemEnabled;
    this.challengeEnabled = challengeEnabled;
    this.pushEnabled = pushEnabled;
    this.emailEnabled = emailEnabled;
    this.quietHoursStart = quietHoursStart;
    this.quietHoursEnd = quietHoursEnd;
  }
}

/**
 * Command para crear presencia (detección de usuario en gym)
 *
 * @typedef {Object} CreatePresenceCommand
 * @property {number} userProfileId - ID del user_profile
 * @property {number} gymId - ID del gimnasio
 * @property {number} distanceMeters - Distancia en metros
 * @property {number} [accuracyMeters] - Precisión en metros
 */
class CreatePresenceCommand {
  constructor({ userProfileId, gymId, distanceMeters, accuracyMeters = null }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
    this.distanceMeters = distanceMeters;
    this.accuracyMeters = accuracyMeters;
  }
}

/**
 * Command para actualizar presencia
 *
 * @typedef {Object} UpdatePresenceCommand
 * @property {number} presenceId - ID de la presencia
 * @property {string} [status] - Estado (DETECTING, CONFIRMED, EXITED)
 * @property {Date} [lastSeenAt] - Última vez visto
 * @property {Date} [exitedAt] - Hora de salida
 * @property {number} [distanceMeters] - Distancia en metros
 * @property {number} [accuracyMeters] - Precisión en metros
 * @property {boolean} [convertedToAssistance] - Si se convirtió en asistencia
 * @property {number} [assistanceId] - ID de la asistencia relacionada
 */
class UpdatePresenceCommand {
  constructor({
    presenceId,
    status,
    lastSeenAt,
    exitedAt,
    distanceMeters,
    accuracyMeters,
    convertedToAssistance,
    assistanceId,
  }) {
    this.presenceId = presenceId;
    this.status = status;
    this.lastSeenAt = lastSeenAt;
    this.exitedAt = exitedAt;
    this.distanceMeters = distanceMeters;
    this.accuracyMeters = accuracyMeters;
    this.convertedToAssistance = convertedToAssistance;
    this.assistanceId = assistanceId;
  }
}

module.exports = {
  UpdateUserProfileCommand,
  UpdateEmailCommand,
  UpdateUserTokensCommand,
  UpdateUserSubscriptionCommand,
  RequestAccountDeletionCommand,
  CancelAccountDeletionCommand,
  UpdateNotificationSettingsCommand,
  CreatePresenceCommand,
  UpdatePresenceCommand,
};
