const { Op } = require('sequelize');
const {
  Notification,
  UserNotificationSetting,
  UserProfile
} = require('../models');
const {
  NotFoundError,
  ValidationError
} = require('../utils/errors');

const TYPE_SETTING_MAP = {
    REMINDER: 'reminder_enabled',
    ACHIEVEMENT: 'achievement_enabled',
    REWARD: 'reward_enabled',
    GYM_UPDATE: 'gym_news_enabled'
};

const NOTIFICATION_TYPES = new Set(Notification.rawAttributes?.type?.values || []);
const PRIORITY_TYPES = new Set(Notification.rawAttributes?.priority?.values || []);

const DEFAULT_SETTINGS = {
  push_enabled: true,
  email_enabled: true,
  reminder_enabled: true,
  achievement_enabled: true,
  reward_enabled: true,
  gym_news_enabled: true,
  quiet_hours_start: null,
  quiet_hours_end: null
};

const ensureUserProfile = async (id_user_profile, transaction) => {
  const userProfile = await UserProfile.findByPk(id_user_profile, {
    attributes: ['id_user_profile'],
    transaction
  });

  if (!userProfile) {
    throw new NotFoundError('Perfil de usuario');
  }

  return userProfile;
};

const ensureSettings = async (id_user_profile, transaction) => {
  await ensureUserProfile(id_user_profile, transaction);
  let settings = await UserNotificationSetting.findByPk(id_user_profile, { transaction });

  if (!settings) {
    settings = await UserNotificationSetting.create(
      { id_user_profile, ...DEFAULT_SETTINGS },
      { transaction }
    );
  }

  return settings;
};

const normalizeEnum = (value, allowedValues, fallback) => {
  if (!value) {
    return fallback;
  }

  const normalized = String(value).toUpperCase();
  return allowedValues.has(normalized) ? normalized : fallback;
};

const isTypeEnabled = (type, settings) => {
  if (!settings) return true;
  const key = TYPE_SETTING_MAP[type];
  return key ? settings[key] !== false : true;
};

const sendPushNotification = async (notification) => {
  // Integracion con Firebase pendiente (fuera de alcance actual)
  console.warn('[notification-service] Push notifications no configuradas');
  return {
    success: false,
    reason: 'push_not_configured',
    notificationId: notification.id_notification
  };
};

const createNotification = async (payload, options = {}) => {
  const {
    id_user_profile,
    type,
    title,
    message,
    action_url,
    icon,
    priority,
    scheduled_for = null,
    expires_at = null
  } = payload;

  if (!id_user_profile) {
    throw new ValidationError('id_user_profile es requerido');
  }

  if (!title) {
    throw new ValidationError('title es requerido');
  }

  if (!message) {
    throw new ValidationError('message es requerido');
  }

  const transaction = options.transaction || null;

  const normalizedType = normalizeEnum(type, NOTIFICATION_TYPES, null);
  if (!normalizedType) {
    throw new ValidationError(`Tipo de notificacion invalido: ${type}`);
  }

  const normalizedPriority = normalizeEnum(priority, PRIORITY_TYPES, 'NORMAL');

  const settings = await ensureSettings(id_user_profile, transaction);

  if (!isTypeEnabled(normalizedType, settings)) {
    return null;
  }

  const notification = await Notification.create({
    id_user_profile,
    type: normalizedType,
    title,
    message,
    action_url: action_url || null,
    icon: icon || null,
    priority: normalizedPriority,
    scheduled_for: scheduled_for ? new Date(scheduled_for) : null,
    expires_at: expires_at ? new Date(expires_at) : null
  }, { transaction });

  const shouldSendNow = !notification.scheduled_for && !notification.sent_at;
  const canSendPush = settings.push_enabled !== false;

  if (shouldSendNow && canSendPush) {
    // No bloquear el flujo si push falla
    sendPushNotification(notification).catch((error) => {
      console.error('[notification-service] Error enviando push:', error.message);
    });
  }

  return notification;
};

const listNotifications = async (id_user_profile, options = {}) => {
  await ensureUserProfile(id_user_profile);

  const {
    limit = 50,
    offset = 0,
    includeRead = true,
    since
  } = options;

  const where = {
    id_user_profile
  };

  if (!includeRead) {
    where.is_read = false;
  }

  if (since) {
    where.created_at = {
      [Op.gte]: new Date(since)
    };
  }

  return Notification.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

const markAsRead = async (id_notification, id_user_profile) => {
  const notification = await Notification.findOne({
    where: {
      id_notification,
      id_user_profile
    }
  });

  if (!notification) {
    throw new NotFoundError('Notificacion');
  }

  if (!notification.is_read) {
    await notification.update({
      is_read: true,
      read_at: new Date()
    });
  }

  return notification;
};

const markAllAsRead = async (id_user_profile) => {
  await ensureUserProfile(id_user_profile);

  const [updated] = await Notification.update({
    is_read: true,
    read_at: new Date()
  }, {
    where: {
      id_user_profile,
      is_read: false
    }
  });

  return updated;
};

const countUnread = async (id_user_profile) => {
  await ensureUserProfile(id_user_profile);

  return Notification.count({
    where: {
      id_user_profile,
      is_read: false
    }
  });
};

const getSettings = async (id_user_profile) => {
  await ensureUserProfile(id_user_profile);
  return ensureSettings(id_user_profile);
};

const updateSettings = async (id_user_profile, payload) => {
  const allowed = [
    'push_enabled',
    'email_enabled',
    'reminder_enabled',
    'achievement_enabled',
    'reward_enabled',
    'gym_news_enabled',
    'quiet_hours_start',
    'quiet_hours_end'
  ];

  const data = {};

  allowed.forEach((key) => {
    if (payload[key] !== undefined) {
      data[key] = payload[key];
    }
  });

  const settings = await ensureSettings(id_user_profile);
  await settings.update(data);
  return settings;
};

const purgeExpiredNotifications = async (now = new Date()) => {
  return Notification.destroy({
    where: {
      expires_at: {
        [Op.lt]: now
      }
    }
  });
};

module.exports = {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  countUnread,
  getSettings,
  updateSettings,
  purgeExpiredNotifications,
  sendPushNotification
};
