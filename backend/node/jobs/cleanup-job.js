const cron = require("node-cron");
const { RefreshToken, GymRequest, WorkoutSession, Routine } = require("../models");
const { Op } = require("sequelize");
const frequencyService = require("../services/frequency-service");
const { emailVerificationRepository, passwordResetRepository } = require("../infra/db/repositories");
const { getArgentinaTime } = require("../utils/timezone");

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
            { is_revoked: true }
          ]
        }
      });

      console.log(`[CLEANUP JOB] Limpieza completada: ${deleted} tokens eliminados`);

      // Limpiar email verification tokens expirados o usados hace más de 7 días
      const deletedVerificationTokens = await emailVerificationRepository.cleanupExpiredTokens();
      if (deletedVerificationTokens > 0) {
        console.log(`[CLEANUP JOB] ${deletedVerificationTokens} tokens de verificación de email eliminados`);
      }

      // Limpiar password reset tokens expirados o usados hace más de 7 días
      const deletedResetTokens = await passwordResetRepository.cleanupExpiredTokens();
      if (deletedResetTokens > 0) {
        console.log(`[CLEANUP JOB] ${deletedResetTokens} tokens de reset de contraseña eliminados`);
      }

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

  // Ejecutar cada hora para limpiar sesiones huérfanas
  cron.schedule("0 * * * *", async () => {
    try {
      await cleanupOrphanedWorkoutSessions();
    } catch (error) {
      console.error("[CLEANUP JOB] Error limpiando sesiones huérfanas:", error.message);
    }
  });

  console.log("[CLEANUP JOB] Cron de limpieza de sesiones iniciado (cada hora)");
};

/**
 * Limpia sesiones de workout huérfanas (rutinas eliminadas)
 * Se ejecuta cada hora automáticamente
 */
const cleanupOrphanedWorkoutSessions = async () => {
  try {
    console.log("\n[CLEANUP JOB] Limpiando sesiones huérfanas...");

    // Buscar sesiones IN_PROGRESS con rutinas que ya no existen
    const orphanedSessions = await WorkoutSession.findAll({
      where: {
        status: 'IN_PROGRESS',
        id_routine: {
          [Op.ne]: null
        }
      },
      include: [
        {
          model: Routine,
          as: 'routine',
          required: false // LEFT JOIN
        }
      ]
    });

    let canceledCount = 0;
    const now = getArgentinaTime();

    for (const session of orphanedSessions) {
      // Si la sesión tiene id_routine pero routine es null, la rutina fue eliminada
      if (!session.routine) {
        console.log(`[CLEANUP JOB] Cancelando sesión huérfana ID: ${session.id_workout_session}, Routine: ${session.id_routine}`);

        await WorkoutSession.update(
          {
            status: 'CANCELED',
            ended_at: now
          },
          {
            where: { id_workout_session: session.id_workout_session }
          }
        );

        canceledCount++;
      }
    }

    if (canceledCount > 0) {
      console.log(`[CLEANUP JOB] ${canceledCount} sesiones huérfanas canceladas`);
    } else {
      console.log("[CLEANUP JOB] No se encontraron sesiones huérfanas");
    }

    return canceledCount;
  } catch (error) {
    console.error("[CLEANUP JOB] Error limpiando sesiones huérfanas:", error.message);
    throw error;
  }
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
          { is_revoked: true }
        ]
      }
    });

    console.log(`[CLEANUP JOB] Limpieza manual completada: ${deleted} tokens eliminados`);

    // Limpiar email verification tokens expirados o usados hace más de 7 días
    const deletedVerificationTokens = await emailVerificationRepository.cleanupExpiredTokens();
    if (deletedVerificationTokens > 0) {
      console.log(`[CLEANUP JOB] ${deletedVerificationTokens} tokens de verificación de email eliminados`);
    }

    // Limpiar password reset tokens expirados o usados hace más de 7 días
    const deletedResetTokens = await passwordResetRepository.cleanupExpiredTokens();
    if (deletedResetTokens > 0) {
      console.log(`[CLEANUP JOB] ${deletedResetTokens} tokens de reset de contraseña eliminados`);
    }

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

    return {
      tokens: deleted,
      verificationTokens: deletedVerificationTokens,
      resetTokens: deletedResetTokens,
      requests: deletedRequests
    };
  } catch (error) {
    console.error("[CLEANUP JOB] Error en limpieza manual:", error.message);
    throw error;
  }
};

module.exports = { startCleanupJob, runCleanupNow, cleanupOrphanedWorkoutSessions };
