'use strict';

/**
 * Migración: Solo índice por duración en assistance
 * - Crea idx_assistance_duration si no existe
 * - No toca otros campos (evita drift con app_tier)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [existing] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM assistance WHERE Key_name = 'idx_assistance_duration'",
        { transaction }
      );
      if (!existing || existing.length === 0) {
        await queryInterface.addIndex('assistance', {
          fields: ['duration_minutes'],
          name: 'idx_assistance_duration'
        }, { transaction });
        console.log('✅ idx_assistance_duration creado');
      } else {
        console.log('ℹ️  idx_assistance_duration ya existe');
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        "DROP INDEX IF EXISTS idx_assistance_duration ON assistance",
        { transaction }
      ).catch(() => {});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

