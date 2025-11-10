const cron = require("node-cron");
const { RefreshToken, GymRequest } = require("../models");
const { Op } = require("sequelize");
const frequencyService = require("../services/frequency-service");

/**
 * Cron job que se ejecuta diariamente a las 3 AM
 * Limpia refresh tokens expirados o revocados y archiva frecuencias los lunes
 */
const startCleanupJob = () => {
  // Ejecutar cada día a las 3 AM
  cron.schedule("0 3 * * *", async () => {
    const now = new Date();
    try {
      console.log("\n[CLEANUP JOB] Ejecutando limpieza automática...");
      console.log(`   Fecha: ${now.toISOString()}`);

      const deleted = await RefreshToken.destroy({
        where: {
          [Op.or]: [
            { expires_at: { [Op.lt]: new Date() } },
            { revoked: true }
          ]
        }
      });

      console.log(`[CLEANUP JOB] Limpieza completada: ${deleted} tokens eliminados`);

      // Eliminar solicitudes de gimnasios pendientes de más de 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedRequests = await GymRequest.destroy({
        where: {
          status: 'pending',
          created_at: { [Op.lt]: thirtyDaysAgo }
        }
      });

      if (deletedRequests > 0) {
        console.log(`[CLEANUP JOB] ${deletedRequests} solicitudes de gimnasios pendientes eliminadas (>30 días)`);
      }

      if (now.getDay() === 1) {
        console.log("[CLEANUP JOB] Archivando frecuencias semanales...");
        await frequencyService.archivarFrecuencias(now);
        console.log("[CLEANUP JOB] Frecuencias archivadas correctamente");
      }
    } catch (error) {
      console.error("[CLEANUP JOB] Error en limpieza automática:", error.message);
    }
  });

  console.log("[CLEANUP JOB] Cron de limpieza iniciado (diario 3 AM)");
};

/**
 * Ejecutar limpieza manual (útil para testing o mantenimiento)
 */
const runCleanupNow = async () => {
  try {
    console.log("\n[CLEANUP JOB] Ejecutando limpieza manual...");

    const deleted = await RefreshToken.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } },
          { revoked: true }
        ]
      }
    });

    console.log(`[CLEANUP JOB] Limpieza manual completada: ${deleted} tokens eliminados`);

    // Eliminar solicitudes de gimnasios pendientes de más de 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedRequests = await GymRequest.destroy({
      where: {
        status: 'pending',
        created_at: { [Op.lt]: thirtyDaysAgo }
      }
    });

    if (deletedRequests > 0) {
      console.log(`[CLEANUP JOB] ${deletedRequests} solicitudes de gimnasios pendientes eliminadas (>30 días)`);
    }

    return { tokens: deleted, requests: deletedRequests };
  } catch (error) {
    console.error("[CLEANUP JOB] Error en limpieza manual:", error.message);
    throw error;
  }
};

module.exports = { startCleanupJob, runCleanupNow };
