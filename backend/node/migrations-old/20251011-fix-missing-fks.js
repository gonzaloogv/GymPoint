'use strict';

/**
 * Migración: Limpieza y FKs Básicas
 *
 * Esta migración:
 * 1. Limpia columnas basura (id_user_new) de migraciones incompletas
 * 2. Agrega FKs solo donde los datos son consistentes
 *
 * NOTA: Algunas FKs se omiten por problemas de integridad de datos existentes.
 *       Estas deben resolverse manualmente antes de agregar las FKs.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Iniciando limpieza y corrección de FKs...\n');

      // Limpieza de columnas basura
      const tablesToClean = ['frequency', 'progress', 'streak', 'gym_payment'];

      for (const table of tablesToClean) {
        const [columns] = await queryInterface.sequelize.query(
          `SHOW COLUMNS FROM \`${table}\` LIKE 'id_user_new'`,
          { transaction }
        );

        if (columns.length > 0) {
          console.log(`📋 Limpiando columna basura en ${table}...`);
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${table}\` DROP COLUMN \`id_user_new\``,
            { transaction }
          );
          console.log(`  ✅ Columna id_user_new eliminada de ${table}\n`);
        }
      }

      //  CORRECCIÓN DE TIPO: streak.id_frequency
      console.log('📋 Corrigiendo tipo de dato en streak.id_frequency...');
      const [[streakFreqType]] = await queryInterface.sequelize.query(
        `SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_NAME = 'streak'
           AND TABLE_SCHEMA = DATABASE()
           AND COLUMN_NAME = 'id_frequency'`,
        { transaction }
      );

      if (streakFreqType.DATA_TYPE === 'tinyint') {
        await queryInterface.sequelize.query(
          `ALTER TABLE \`streak\` MODIFY COLUMN \`id_frequency\` INT NOT NULL`,
          { transaction }
        );
        console.log(`  ✅ streak.id_frequency: TINYINT → INT\n`);
      }

      await transaction.commit();

      console.log('========================================');
      console.log('✅ LIMPIEZA COMPLETADA');
      console.log('========================================');
      console.log('✅ Columnas basura eliminadas');
      console.log('✅ Tipos de datos corregidos');
      console.log('========================================');
      console.log('⚠️  NOTA: Las Foreign Keys se agregarán en una migración futura');
      console.log('    después de resolver problemas de integridad de datos.');
      console.log('========================================\n');

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error en migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Revirtiendo cambios...\n');

      // Revertir tipo de dato
      await queryInterface.sequelize.query(
        `ALTER TABLE \`streak\` MODIFY COLUMN \`id_frequency\` TINYINT NOT NULL`,
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Reversión completada\n');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al revertir:', error);
      throw error;
    }
  }
};
