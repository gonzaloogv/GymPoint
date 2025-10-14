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
    console.log('ℹ️  Job de desafíos diarios ya está corriendo');
    return;
  }

  jobInstance = cron.schedule('1 0 * * *', async () => {
    try {
      console.log('🕛 [Job] Generando desafío del día...');
      const challenge = await challengeService.ensureTodayChallenge();
      console.log(`✅ [Job] Desafío del día asegurado: "${challenge.title}"`);
    } catch (error) {
      console.error('[Job] Error generando desafío diario:', error.message);
    }
  }, { timezone: 'UTC' });

  console.log('✅ Job de desafíos diarios iniciado (00:01 UTC)');
};

const stopDailyChallengeJob = () => {
  if (jobInstance) {
    jobInstance.stop();
    jobInstance = null;
    console.log('⏹️  Job de desafíos diarios detenido');
  }
};

const runNow = async () => {
  try {
    console.log('▶️  Ejecutando generación de desafío manual...');
    const challenge = await challengeService.ensureTodayChallenge();
    console.log(`✅ Desafío asegurado: "${challenge.title}"`);
    return challenge;
  } catch (error) {
    console.error('Error en ejecución manual:', error.message);
    throw error;
  }
};

module.exports = { startDailyChallengeJob, stopDailyChallengeJob, runNow };

