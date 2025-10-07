const cron = require('node-cron');
const { RefreshToken } = require('../models');
const { Op} = require('sequelize');

/**
 * Cron job que se ejecuta diariamente a las 3 AM
 * Limpia refresh tokens expirados o revocados
 */
const startCleanupJob = () => {
  // Ejecutar cada día a las 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('\n🧹 [CLEANUP JOB] Ejecutando limpieza automática...');
      console.log(`   Fecha: ${new Date().toISOString()}`);

      // Eliminar refresh tokens expirados o revocados
      const deleted = await RefreshToken.destroy({
        where: {
          [Op.or]: [
            { expires_at: { [Op.lt]: new Date() } },
            { revoked: true }
          ]
        }
      });

      console.log(`✅ [CLEANUP JOB] Limpieza completada: ${deleted} tokens eliminados\n`);
    } catch (error) {
      console.error('❌ [CLEANUP JOB] Error en limpieza automática:', error.message);
    }
  });

  console.log('🚀 Cron de limpieza iniciado (diario 3 AM)');
};

/**
 * Ejecutar limpieza manual (útil para testing o mantenimiento)
 */
const runCleanupNow = async () => {
  try {
    console.log('\n🧹 Ejecutando limpieza manual...');

    const deleted = await RefreshToken.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } },
          { revoked: true }
        ]
      }
    });

    console.log(`✅ Limpieza manual completada: ${deleted} tokens eliminados\n`);
    return deleted;
  } catch (error) {
    console.error('❌ Error en limpieza manual:', error.message);
    throw error;
  }
};

module.exports = { startCleanupJob, runCleanupNow };
