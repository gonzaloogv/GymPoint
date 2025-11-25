const cron = require('node-cron');
const { Op } = require('sequelize');
const { Notification } = require('../models');
const notificationService = require('../services/notification-service');

let isProcessing = false;
let scheduledTask = null;

const processScheduledNotifications = async () => {
  if (isProcessing) {
    console.log('[notifications-job] Ejecucion previa en curso, se omite ciclo.');
    return;
  }

  isProcessing = true;

  try {
    const now = new Date();

    const pending = await Notification.findAll({
      where: {
        scheduled_for: { [Op.lte]: now },
        sent_at: null
      },
      order: [
        ['scheduled_for', 'ASC'],
        ['id_notification', 'ASC']
      ],
      limit: 100
    });

    if (!pending.length) {
      return;
    }

    console.log(`[notifications-job] Procesando ${pending.length} notificaciones programadas`);

    for (const notification of pending) {
      // Ignorar expiradas
      if (notification.expires_at && notification.expires_at < now) {
        await notification.destroy();
        continue;
      }

      try {
        await notificationService.sendPushNotification(notification);
        await notification.update({ sent_at: new Date() });
      } catch (error) {
        console.error(`[notifications-job] Error enviando notificacion ${notification.id_notification}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[notifications-job] Error general:', error.message);
  } finally {
    isProcessing = false;
  }
};

const startScheduledNotificationsJob = (cronExpression = '*/15 * * * *') => {
  if (scheduledTask) {
    return scheduledTask;
  }

  scheduledTask = cron.schedule(cronExpression, () => {
    processScheduledNotifications().catch((error) => {
      console.error('[notifications-job] Error no controlado:', error);
    });
  });

  console.log(`[notifications-job] Programador iniciado (${cronExpression})`);
  return scheduledTask;
};

module.exports = {
  startScheduledNotificationsJob,
  processScheduledNotifications
};

