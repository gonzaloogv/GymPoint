/**
 * Notification Service - Lote 9 CQRS Refactor
 * Business logic for notifications using Commands/Queries
 */

const { notificationRepository, userProfileRepository } = require('../infra/db/repositories');
const { NotFoundError, ValidationError } = require('../utils/errors');
const sequelize = require('../config/database');

// ============================================================================
// HELPERS
// ============================================================================

const NOTIFICATION_TYPES = new Set(['REMINDER', 'ACHIEVEMENT', 'REWARD', 'GYM_UPDATE', 'PAYMENT', 'SOCIAL', 'SYSTEM', 'CHALLENGE']);
const PRIORITY_TYPES = new Set(['LOW', 'NORMAL', 'HIGH']);

const DEFAULT_SETTINGS = {
  push_enabled: true,
  email_enabled: true,
  reminder_enabled: true,
  achievement_enabled: true,
  reward_enabled: true,
  gym_news_enabled: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

const normalizeEnum = (value, allowedValues, fallback) => {
  if (!value) return fallback;
  const normalized = String(value).toUpperCase();
  return allowedValues.has(normalized) ? normalized : fallback;
};

const sendPushNotification = async (notification) => {
  console.warn('[notification-service] Push notifications no configuradas');
  return {
    success: false,
    reason: 'push_not_configured',
    notificationId: notification.id_notification,
  };
};

// ============================================================================
// CREATE NOTIFICATION
// ============================================================================

async function createNotification(command, options = {}) {
  const transaction = options.transaction || null;

  // Normalize and validate
  const normalizedType = normalizeEnum(command.type, NOTIFICATION_TYPES, null);
  if (!normalizedType) {
    throw new ValidationError(`Tipo de notificación inválido: ${command.type}`);
  }

  const normalizedPriority = normalizeEnum(command.priority, PRIORITY_TYPES, 'NORMAL');

  // Verify user exists and get settings
  const userProfile = await userProfileRepository.findById(command.userProfileId, { transaction });
  if (!userProfile) {
    throw new NotFoundError('Perfil de usuario');
  }

  const settings = await notificationRepository.findNotificationSettings(command.userProfileId, { transaction });

  // Check if notification type is enabled
  const TYPE_SETTING_MAP = {
    REMINDER: 'reminder_enabled',
    ACHIEVEMENT: 'achievement_enabled',
    REWARD: 'reward_enabled',
    GYM_UPDATE: 'gym_news_enabled',
  };

  const settingKey = TYPE_SETTING_MAP[normalizedType];
  if (settings && settingKey && settings[settingKey] === false) {
    return null; // User has disabled this notification type
  }

  // Create notification
  const notification = await notificationRepository.createNotification({
    id_user_profile: command.userProfileId,
    type: normalizedType,
    title: command.title,
    message: command.message,
    data: command.data,
    priority: normalizedPriority,
    scheduled_for: command.scheduledFor ? new Date(command.scheduledFor) : null,
  }, { transaction });

  // Send push if not scheduled and push enabled
  const shouldSendNow = !notification.scheduled_for && !notification.sent_at;
  const canSendPush = !settings || settings.push_enabled !== false;

  if (shouldSendNow && canSendPush) {
    sendPushNotification(notification).catch((error) => {
      console.error('[notification-service] Error enviando push:', error.message);
    });
  }

  return notification;
}

// ============================================================================
// MARK AS READ
// ============================================================================

async function markNotificationAsRead(command) {
  const notification = await notificationRepository.markNotificationAsRead(
    command.notificationId,
    command.userProfileId
  );

  if (!notification) {
    throw new NotFoundError('Notificación');
  }

  return notification;
}

async function markAllNotificationsAsRead(command) {
  return notificationRepository.markAllNotificationsAsRead(command.userProfileId);
}

// ============================================================================
// LIST & COUNT
// ============================================================================

async function listNotifications(query) {
  return notificationRepository.findNotifications(query.userProfileId, {
    page: query.page,
    limit: query.limit,
    includeRead: query.includeRead,
    type: query.type,
    priority: query.priority,
    since: query.since,
  });
}

async function countUnreadNotifications(query) {
  return notificationRepository.countUnreadNotifications(query.userProfileId);
}

// ============================================================================
// DELETE
// ============================================================================

async function deleteNotification(command) {
  const deleted = await notificationRepository.deleteNotification(
    command.notificationId,
    command.userProfileId
  );

  if (!deleted) {
    throw new NotFoundError('Notificación');
  }

  return { success: true };
}

// ============================================================================
// SCHEDULED NOTIFICATIONS
// ============================================================================

async function sendScheduledNotifications(command) {
  const notifications = await notificationRepository.findScheduledNotifications(
    command.beforeDate,
    100
  );

  let sentCount = 0;

  for (const notification of notifications) {
    try {
      const settings = await notificationRepository.findNotificationSettings(notification.id_user_profile);
      const canSendPush = !settings || settings.push_enabled !== false;

      if (canSendPush) {
        await sendPushNotification(notification);
      }

      await notificationRepository.markNotificationAsSent(notification.id_notification);
      sentCount++;
    } catch (error) {
      console.error(`[notification-service] Error enviando notificación ${notification.id_notification}:`, error.message);
    }
  }

  return { sent: sentCount, total: notifications.length };
}

// ============================================================================
// SUBSCRIPTION EXPIRATION NOTIFICATIONS
// ============================================================================

async function notifyExpiringSubscriptions(command) {
  const { userGymRepository } = require('../infra/db/repositories');

  const daysBeforeExpiry = command.daysBeforeExpiry || 7;

  // Buscar suscripciones próximas a vencer
  const expiringSubscriptions = await userGymRepository.findExpiringSubscriptions(daysBeforeExpiry, 100);

  let notifiedCount = 0;

  for (const subscription of expiringSubscriptions) {
    try {
      const daysRemaining = Math.ceil((new Date(subscription.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));

      const title = 'Tu suscripción está por vencer';
      const message = daysRemaining === 1
        ? `Tu suscripción a ${subscription.gym?.name || 'tu gimnasio'} vence mañana. Renuévala para seguir entrenando.`
        : `Tu suscripción a ${subscription.gym?.name || 'tu gimnasio'} vence en ${daysRemaining} días. No olvides renovarla.`;

      await createNotification({
        userProfileId: subscription.id_user_profile,
        type: 'GYM_UPDATE',
        title,
        message,
        priority: daysRemaining <= 3 ? 'HIGH' : 'NORMAL',
        data: {
          gymId: subscription.id_gym,
          gymName: subscription.gym?.name,
          subscriptionEnd: subscription.subscription_end,
          daysRemaining,
        },
      });

      notifiedCount++;
    } catch (error) {
      console.error(`[notification-service] Error notificando suscripción ${subscription.id_user_gym}:`, error.message);
    }
  }

  return { notified: notifiedCount, total: expiringSubscriptions.length };
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

async function getNotificationSettings(query) {
  let settings = await notificationRepository.findNotificationSettings(query.userProfileId);

  if (!settings) {
    settings = await notificationRepository.createNotificationSettings(
      query.userProfileId,
      DEFAULT_SETTINGS
    );
  }

  return settings;
}

async function updateNotificationSettings(command) {
  const transaction = await sequelize.transaction();

  try {
    // Verify user exists
    const userProfile = await userProfileRepository.findById(command.userProfileId, { transaction });
    if (!userProfile) {
      throw new NotFoundError('Perfil de usuario');
    }

    // Ensure settings exist
    let settings = await notificationRepository.findNotificationSettings(command.userProfileId, { transaction });
    if (!settings) {
      settings = await notificationRepository.createNotificationSettings(
        command.userProfileId,
        DEFAULT_SETTINGS,
        { transaction }
      );
    }

    // Update settings
    const updates = {};
    if (command.pushEnabled !== undefined) updates.push_enabled = command.pushEnabled;
    if (command.emailEnabled !== undefined) updates.email_enabled = command.emailEnabled;
    if (command.reminderEnabled !== undefined) updates.reminder_enabled = command.reminderEnabled;
    if (command.achievementEnabled !== undefined) updates.achievement_enabled = command.achievementEnabled;
    if (command.rewardEnabled !== undefined) updates.reward_enabled = command.rewardEnabled;
    if (command.gymNewsEnabled !== undefined) updates.gym_news_enabled = command.gymNewsEnabled;
    if (command.quietHoursStart !== undefined) updates.quiet_hours_start = command.quietHoursStart;
    if (command.quietHoursEnd !== undefined) updates.quiet_hours_end = command.quietHoursEnd;

    const updated = await notificationRepository.updateNotificationSettings(
      command.userProfileId,
      updates,
      { transaction }
    );

    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

const countUnread = async (userProfileId) => {
  return notificationRepository.countUnreadNotifications(userProfileId);
};

const markAsRead = async (notificationId, userProfileId) => {
  return markNotificationAsRead({ notificationId, userProfileId });
};

const markAllAsRead = async (userProfileId) => {
  return markAllNotificationsAsRead({ userProfileId });
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // CQRS API
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  listNotifications,
  countUnreadNotifications,
  deleteNotification,
  sendScheduledNotifications,
  notifyExpiringSubscriptions,
  getNotificationSettings,
  updateNotificationSettings,

  // Legacy compatibility
  countUnread,
  markAsRead,
  markAllAsRead,
};
