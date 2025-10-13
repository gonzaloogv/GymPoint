const cron = require('node-cron');
const { Op } = require('sequelize');
const { AccountDeletionRequest } = require('../models');
const userService = require('../services/user-service');
const { ACCOUNT_DELETION, ACCOUNT_DELETION_STATUS } = require('../config/constants');

const dateToIsoDate = (date) => date.toISOString().slice(0, 10);

const findPendingRequests = async (batchSize) => {
  const today = dateToIsoDate(new Date());

  return AccountDeletionRequest.findAll({
    where: {
      status: ACCOUNT_DELETION_STATUS.PENDING,
      scheduled_deletion_date: {
        [Op.lte]: today
      }
    },
    order: [
      ['scheduled_deletion_date', 'ASC'],
      ['requested_at', 'ASC']
    ],
    limit: batchSize
  });
};

const processBatch = async (requests) => {
  let processed = 0;

  for (const request of requests) {
    try {
      await userService.procesarSolicitudEliminacion(request);
      processed += 1;
      console.log(`[ACCOUNT DELETION JOB] Solicitud ${request.id_request} procesada correctamente`);
    } catch (error) {
      console.error(`[ACCOUNT DELETION JOB] Error procesando solicitud ${request.id_request}: ${error.message}`);
    }
  }

  return processed;
};

const runAccountDeletion = async () => {
  const batchSize = ACCOUNT_DELETION.BATCH_SIZE > 0 ? ACCOUNT_DELETION.BATCH_SIZE : 50;
  let totalProcessed = 0;
  let iteration = 0;

  while (true) {
    iteration += 1;
    const requests = await findPendingRequests(batchSize);

    if (!requests.length) {
      break;
    }

    console.log(`[ACCOUNT DELETION JOB] Iteración ${iteration} - Procesando ${requests.length} solicitudes programadas`);
    const processed = await processBatch(requests);
    totalProcessed += processed;

    if (requests.length < batchSize) {
      break;
    }
  }

  if (totalProcessed > 0) {
    console.log(`[ACCOUNT DELETION JOB] Total de solicitudes procesadas: ${totalProcessed}`);
  } else {
    console.log('[ACCOUNT DELETION JOB] No se encontraron solicitudes pendientes para procesar');
  }

  return totalProcessed;
};

const startAccountDeletionJob = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('[ACCOUNT DELETION JOB] Inicio de ejecución programada (02:00).');
    try {
      await runAccountDeletion();
    } catch (error) {
      console.error(`[ACCOUNT DELETION JOB] Error general en ejecución programada: ${error.message}`);
    }
  });

  console.log('[ACCOUNT DELETION JOB] Cron de eliminación de cuentas iniciado (diario 02:00).');
};

module.exports = {
  startAccountDeletionJob,
  runAccountDeletionNow: runAccountDeletion
};
