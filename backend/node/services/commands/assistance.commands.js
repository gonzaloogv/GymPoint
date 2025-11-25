/**
 * Commands para Assistance
 * Commands son write operations (crear, actualizar, eliminar)
 */

/**
 * Command para crear asistencia (check-in)
 */
class CreateAssistanceCommand {
  constructor({
    userProfileId,
    gymId,
    latitude,
    longitude,
    accuracy = null,
    autoCheckin = false,
    distanceMeters = null,
    verified = false
  }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = accuracy;
    this.autoCheckin = autoCheckin;
    this.distanceMeters = distanceMeters;
    this.verified = verified;
  }
}

/**
 * Command para checkout de asistencia
 */
class CheckOutCommand {
  constructor({ assistanceId, userProfileId }) {
    this.assistanceId = assistanceId;
    this.userProfileId = userProfileId;
  }
}

/**
 * Command para registrar/actualizar presencia en geofence
 */
class RegisterPresenceCommand {
  constructor({ userProfileId, gymId, latitude, longitude, accuracy = null }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = accuracy;
  }
}

/**
 * Command para verificar y crear auto check-in desde presencia
 */
class VerifyAutoCheckInCommand {
  constructor({ userProfileId, gymId }) {
    this.userProfileId = userProfileId;
    this.gymId = gymId;
  }
}

module.exports = {
  CreateAssistanceCommand,
  CheckOutCommand,
  RegisterPresenceCommand,
  VerifyAutoCheckInCommand
};
