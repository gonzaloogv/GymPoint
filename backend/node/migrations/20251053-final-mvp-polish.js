'use strict';

/**
 * Migración opcional: Polish final para MVP
 *
 * Completa los 2 campos opcionales restantes:
 * 1. user_profiles.app_tier (para monetización)
 * 2. Índice idx_assistance_duration (para performance)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log('Aplicando polish final para MVP...');

      // 1. Agregar app_tier a user_profiles
      const [userProfileCols] = await queryInterface.sequelize.query(
        "SHOW COLUMNS FROM user_profiles LIKE 'app_tier'",
        { transaction }
      );

      if (userProfileCols.length === 0) {
        await queryInterface.sequelize.query(`
          ALTER TABLE user_profiles
          ADD COLUMN app_tier ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE'
          AFTER onboarding_completed
        `, { transaction });
        console.log('  ✓ user_profiles.app_tier creado');
      } else {
        console.log('  ⊘ user_profiles.app_tier ya existe');
      }

      // 2. Agregar índice de duración
      const [durationIndex] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM assistance WHERE Key_name = 'idx_assistance_duration'",
        { transaction }
      );

      if (durationIndex.length === 0) {
        await queryInterface.addIndex('assistance', {
          fields: ['duration_minutes'],
          name: 'idx_assistance_duration'
        }, { transaction });
        console.log('  ✓ idx_assistance_duration creado');
      } else {
        console.log('  ⊘ idx_assistance_duration ya existe');
      }

      await transaction.commit();
      console.log('\n✅ Polish final MVP completado - Base de datos al 100%\n');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en polish final:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Quitar índice
      await queryInterface.sequelize.query(
        "DROP INDEX IF EXISTS idx_assistance_duration ON assistance",
        { transaction }
      ).catch(() => {});

      // Quitar columna app_tier
      const [cols] = await queryInterface.sequelize.query(
        "SHOW COLUMNS FROM user_profiles LIKE 'app_tier'",
        { transaction }
      );

      if (cols.length > 0) {
        await queryInterface.removeColumn('user_profiles', 'app_tier', { transaction });
      }

      await transaction.commit();
      console.log('✓ Rollback polish final completado');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en rollback:', error.message);
      throw error;
    }
  }
};
