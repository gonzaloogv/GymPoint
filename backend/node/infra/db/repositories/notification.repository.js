/**
 * Notification Repository - Lote 9
 * Data access layer for notifications
 */

const { Notification, UserNotificationSetting } = require('../../../models');
const { toNotification, toNotifications } = require('../mappers/notification.mapper');
const { Op } = require('sequelize');

// ============================================================================
// CREATE
// ============================================================================

async function createNotification(payload, options = {}) {
  const notification = await Notification.create(payload, {
    transaction: options.transaction,
  });
  return toNotification(notification);
}

// ============================================================================
// READ
// ============================================================================

async function findNotificationById(id, options = {}) {
  const notification = await Notification.findByPk(id, {
    transaction: options.transaction,
  });
  return toNotification(notification);
}

async function findNotificationByIdAndUser(id, userProfileId, options = {}) {
  const notification = await Notification.findOne({
    where: {
      id_notification: id,
      id_user_profile: userProfileId,
    },
    transaction: options.transaction,
  });
  return toNotification(notification);
}

async function findNotifications(userProfileId, filters = {}, options = {}) {
  const { page = 1, limit = 20, includeRead = true, type = null, priority = null, since = null } = filters;
  const offset = (page - 1) * limit;

  const where = { id_user_profile: userProfileId };

  if (!includeRead) {
    where.is_read = false;
  }

  if (type) {
    where.type = type;
  }

  if (priority) {
    where.priority = priority;
  }

  if (since) {
    where.created_at = { [Op.gte]: new Date(since) };
  }

  const { count, rows } = await Notification.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    transaction: options.transaction,
  });

  return {
    items: toNotifications(rows),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

async function countUnreadNotifications(userProfileId, options = {}) {
  return Notification.count({
    where: {
      id_user_profile: userProfileId,
      is_read: false,
    },
    transaction: options.transaction,
  });
}

async function findScheduledNotifications(beforeDate, limit = 100, options = {}) {
  const notifications = await Notification.findAll({
    where: {
      scheduled_for: {
        [Op.lte]: beforeDate,
        [Op.ne]: null,
      },
      sent_at: null,
    },
    limit,
    order: [['scheduled_for', 'ASC']],
    transaction: options.transaction,
  });

  return toNotifications(notifications);
}

// ============================================================================
// UPDATE
// ============================================================================

async function markNotificationAsRead(id, userProfileId, options = {}) {
  const [updatedCount] = await Notification.update(
    {
      is_read: true,
      read_at: new Date(),
    },
    {
      where: {
        id_notification: id,
        id_user_profile: userProfileId,
        is_read: false,
      },
      transaction: options.transaction,
    }
  );

  if (updatedCount === 0) {
    return null;
  }

  return findNotificationById(id, options);
}

async function markAllNotificationsAsRead(userProfileId, options = {}) {
  const [updatedCount] = await Notification.update(
    {
      is_read: true,
      read_at: new Date(),
    },
    {
      where: {
        id_user_profile: userProfileId,
        is_read: false,
      },
      transaction: options.transaction,
    }
  );

  return updatedCount;
}

async function markNotificationAsSent(id, options = {}) {
  await Notification.update(
    {
      sent_at: new Date(),
    },
    {
      where: { id_notification: id },
      transaction: options.transaction,
    }
  );
}

// ============================================================================
// DELETE
// ============================================================================

async function deleteNotification(id, userProfileId, options = {}) {
  const deleted = await Notification.destroy({
    where: {
      id_notification: id,
      id_user_profile: userProfileId,
    },
    transaction: options.transaction,
  });

  return deleted > 0;
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

async function findNotificationSettings(userProfileId, options = {}) {
  const settings = await UserNotificationSetting.findOne({
    where: { id_user_profile: userProfileId },
    transaction: options.transaction,
  });

  if (!settings) return null;

  return settings.get({ plain: true });
}

async function createNotificationSettings(userProfileId, payload, options = {}) {
  const settings = await UserNotificationSetting.create(
    {
      id_user_profile: userProfileId,
      ...payload,
    },
    { transaction: options.transaction }
  );

  return settings.get({ plain: true });
}

async function updateNotificationSettings(userProfileId, updates, options = {}) {
  await UserNotificationSetting.update(updates, {
    where: { id_user_profile: userProfileId },
    transaction: options.transaction,
  });

  return findNotificationSettings(userProfileId, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  createNotification,
  findNotificationById,
  findNotificationByIdAndUser,
  findNotifications,
  countUnreadNotifications,
  findScheduledNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markNotificationAsSent,
  deleteNotification,
  findNotificationSettings,
  createNotificationSettings,
  updateNotificationSettings,
};
