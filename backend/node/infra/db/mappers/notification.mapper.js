/**
 * Notification Infra Mapper - Lote 9
 * Transforms Sequelize Notification models to POJOs
 */

// ============================================================================
// SINGLE ENTITY MAPPERS
// ============================================================================

function toNotification(model) {
  if (!model) return null;

  const plain = model.get ? model.get({ plain: true }) : model;

  return {
    id_notification: plain.id_notification,
    id_user_profile: plain.id_user_profile,
    type: plain.type,
    title: plain.title,
    message: plain.message,
    data: plain.data,
    priority: plain.priority,
    is_read: plain.is_read,
    read_at: plain.read_at,
    scheduled_for: plain.scheduled_for,
    sent_at: plain.sent_at,
    created_at: plain.created_at,
  };
}

// ============================================================================
// ARRAY MAPPERS
// ============================================================================

function toNotifications(models) {
  if (!Array.isArray(models)) return [];
  return models.map(toNotification);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  toNotification,
  toNotifications,
};
