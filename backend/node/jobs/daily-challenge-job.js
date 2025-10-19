/**
 * Job: Generar desafío diario automático
 * - Corre diariamente a las 00:01 UTC para asegurar el desafío del día (idempotente)
 * - Schedule: 1 0 * * * (00:01 todos los días)
 */

const cron = require('node-cron');
const challengeService = require('../services/challenge-service');

let jobInstance = null;

const startDailyChallengeJob = () => {
  if (jobInstance) {
    console.log('[daily-challenge-job] Ya se encuentra en ejecución');
    return;
  }

  jobInstance = cron.schedule(
    '1 0 * * *',
    async () => {
      try {
        console.log('[daily-challenge-job] Ejecutando generación automática...');
        const challenge = await challengeService.ensureTodayChallenge();
        if (challenge) {
          console.log(`[daily-challenge-job] Desafío asegurado: "${challenge.title}"`);
        } else {
          console.log('[daily-challenge-job] Sin desafío nuevo (rotación deshabilitada o sin plantillas activas)');
        }
      } catch (error) {
        console.error('[daily-challenge-job] Error generando desafío diario:', error.message);
      }
    },
    { timezone: 'UTC' }
  );

  console.log('[daily-challenge-job] Programador iniciado (00:01 UTC)');
};

const stopDailyChallengeJob = () => {
  if (jobInstance) {
    jobInstance.stop();
    jobInstance = null;
    console.log('[daily-challenge-job] Programador detenido');
  }
};

const runNow = async () => {
  try {
    console.log('[daily-challenge-job] Ejecución manual solicitada...');
    const challenge = await challengeService.ensureTodayChallenge();
    if (challenge) {
      console.log(`[daily-challenge-job] Desafío asegurado: "${challenge.title}"`);
    } else {
      console.log('[daily-challenge-job] No se generó nuevo desafío (rotación deshabilitada o sin plantillas activas)');
    }
    return challenge;
  } catch (error) {
    console.error('[daily-challenge-job] Error en ejecución manual:', error.message);
    throw error;
  }
};

module.exports = {
  startDailyChallengeJob,
  stopDailyChallengeJob,
  runNow
};

