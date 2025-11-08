/**
 * Job: Resetear frecuencias semanales y streaks
 * - Corre cada lunes a las 00:00 UTC-3 (03:00 UTC)
 * - Resetea asistencias semanales
 * - Si NO cumplió meta (assist < goal): resetea streak a 0
 * - Crea historial y otorga tokens si cumplió meta
 * - Schedule: 0 3 * * 1 (lunes 03:00 UTC = 00:00 UTC-3)
 */

const cron = require('node-cron');
const frequencyService = require('../services/frequency-service');

let jobInstance = null;

const startWeeklyFrequencyResetJob = () => {
  if (jobInstance) {
    console.log('[weekly-frequency-reset-job] Ya se encuentra en ejecución');
    return;
  }

  // Lunes a las 03:00 UTC (00:00 UTC-3 Argentina)
  jobInstance = cron.schedule(
    '0 3 * * 1',
    async () => {
      try {
        console.log('[weekly-frequency-reset-job] Ejecutando reset semanal...');
        const startTime = Date.now();

        await frequencyService.resetWeek();

        const duration = Date.now() - startTime;
        console.log(`[weekly-frequency-reset-job] Reset semanal completado en ${duration}ms`);
      } catch (error) {
        console.error('[weekly-frequency-reset-job] Error en reset semanal:', error.message);
        console.error(error.stack);
      }
    },
    { timezone: 'UTC' }
  );

  console.log('[weekly-frequency-reset-job] Programador iniciado (Lunes 00:00 UTC-3 / 03:00 UTC)');
};

const stopWeeklyFrequencyResetJob = () => {
  if (jobInstance) {
    jobInstance.stop();
    jobInstance = null;
    console.log('[weekly-frequency-reset-job] Programador detenido');
  }
};

const runNow = async () => {
  try {
    console.log('[weekly-frequency-reset-job] Ejecución manual solicitada...');
    const startTime = Date.now();

    await frequencyService.resetWeek();

    const duration = Date.now() - startTime;
    console.log(`[weekly-frequency-reset-job] Reset semanal completado manualmente en ${duration}ms`);
    return { success: true, duration };
  } catch (error) {
    console.error('[weekly-frequency-reset-job] Error en ejecución manual:', error.message);
    throw error;
  }
};

module.exports = {
  startWeeklyFrequencyResetJob,
  stopWeeklyFrequencyResetJob,
  runNow
};
