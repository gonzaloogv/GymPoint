const { UserNotificationSetting } = require('../../../models');
const { toNotificationSetting } = require('../../db/mappers/user-notification-setting.mapper');

/**
 * Encuentra configuración de notificaciones por ID de usuario
 */
async function findByUserProfileId(idUserProfile, options = {}) {
  let setting = await UserNotificationSetting.findOne({
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction,
  });

  // Si no existe, crear configuración por defecto
  if (!setting) {
    setting = await createDefaultSettings(idUserProfile, options);
  }

  return toNotificationSetting(setting);
}

/**
 * Crea configuración de notificaciones por defecto
 */
async function createDefaultSettings(idUserProfile, options = {}) {
  const defaultSettings = {
    id_user_profile: idUserProfile,
    reminders_enabled: true,
    achievements_enabled: true,
    rewards_enabled: true,
    gym_updates_enabled: true,
    payment_enabled: true,
    social_enabled: true,
    system_enabled: true,
    challenge_enabled: true,
    push_enabled: true,
    email_enabled: false,
    quiet_hours_start: null,
    quiet_hours_end: null,
  };

  const setting = await UserNotificationSetting.create(defaultSettings, {
    transaction: options.transaction,
  });

  return toNotificationSetting(setting);
}

/**
 * Actualiza configuración de notificaciones
 */
async function updateSettings(idUserProfile, payload, options = {}) {
  // Buscar o crear configuración
  let setting = await UserNotificationSetting.findOne({
    where: { id_user_profile: idUserProfile },
    transaction: options.transaction,
  });

  if (!setting) {
    // Si no existe, crear con los valores proporcionados
    setting = await UserNotificationSetting.create(
      {
        id_user_profile: idUserProfile,
        ...payload,
      },
      {
        transaction: options.transaction,
      }
    );
  } else {
    // Actualizar configuración existente
    await setting.update(payload, {
      transaction: options.transaction,
    });
  }

  return toNotificationSetting(setting);
}

module.exports = {
  findByUserProfileId,
  createDefaultSettings,
  updateSettings,
};
