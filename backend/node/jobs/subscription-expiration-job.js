const cron = require('node-cron');
const notificationService = require('../services/notification-service');

let isProcessing = false;
let scheduledTask = null;

const processExpiringSubscriptions = async () => {
  if (isProcessing) {
    console.log('[subscription-expiration-job] Ejecucion previa en curso, se omite ciclo.');
    return;
  }

  isProcessing = true;

  try {
    console.log('[subscription-expiration-job] Verificando suscripciones próximas a vencer...');

    // Notificar suscripciones que vencen en 7 días o menos
    const result = await notificationService.notifyExpiringSubscriptions({
      daysBeforeExpiry: 7
    });

    if (result.notified > 0) {
      console.log(`[subscription-expiration-job] ${result.notified} notificaciones enviadas de ${result.total} suscripciones próximas a vencer`);
    }
  } catch (error) {
    console.error('[subscription-expiration-job] Error general:', error.message);
  } finally {
    isProcessing = false;
  }
};

const startSubscriptionExpirationJob = (cronExpression = '0 9 * * *') => {
  if (scheduledTask) {
    return scheduledTask;
  }

  scheduledTask = cron.schedule(cronExpression, () => {
    processExpiringSubscriptions().catch((error) => {
      console.error('[subscription-expiration-job] Error no controlado:', error);
    });
  });

  console.log(`[subscription-expiration-job] Programador iniciado (${cronExpression}) - Ejecuta diariamente a las 9 AM`);
  return scheduledTask;
};

module.exports = {
  startSubscriptionExpirationJob,
  processExpiringSubscriptions
};
