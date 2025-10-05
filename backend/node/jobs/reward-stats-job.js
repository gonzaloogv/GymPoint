const rewardStatsService = require('../services/reward-stats-service');

/**
 * Job: Consolidar estadÃ­sticas de recompensas en reward_gym_stats_daily
 * 
 * Ejecuta cada 5 minutos y consolida las Ãºltimas 10 minutos de datos
 * usando upsert idempotente (INSERT ... ON DUPLICATE KEY UPDATE)
 */

let isRunning = false;

const runRewardStatsJob = async () => {
  if (isRunning) {
    console.log('â­ï¸  Job reward-stats ya en ejecuciÃ³n, saltando...');
    return;
  }
  
  isRunning = true;
  
  try {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    console.log(`ðŸ”„ [${now.toISOString()}] Ejecutando reward-stats-job...`);
    console.log(`   Ventana: ${tenMinutesAgo.toISOString()} â†’ ${now.toISOString()}`);
    
    await rewardStatsService.runDailyUpsert(tenMinutesAgo, now);
    
    console.log(`âœ… [${now.toISOString()}] reward-stats-job completado`);
    
  } catch (error) {
    console.error(`âŒ [${new Date().toISOString()}] Error en reward-stats-job:`, error.message);
    console.error(error.stack);
  } finally {
    isRunning = false;
  }
};

/**
 * Iniciar el job con setInterval
 * @param {number} intervalMs - Intervalo en milisegundos (default: 5 minutos)
 */
const startRewardStatsJob = (intervalMs = 5 * 60 * 1000) => {
  console.log(`ðŸš€ Iniciando reward-stats-job (cada ${intervalMs / 1000}s)`);
  
  // Ejecutar inmediatamente al iniciar (opcional)
  // runRewardStatsJob();
  
  // Ejecutar periÃ³dicamente
  const interval = setInterval(runRewardStatsJob, intervalMs);
  
  // Manejar cierre graceful
  process.on('SIGINT', () => {
    console.log('\nðŸ›‘ Deteniendo reward-stats-job...');
    clearInterval(interval);
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\nðŸ›‘ Deteniendo reward-stats-job...');
    clearInterval(interval);
    process.exit(0);
  });
  
  return interval;
};

module.exports = {
  runRewardStatsJob,
  startRewardStatsJob
};
