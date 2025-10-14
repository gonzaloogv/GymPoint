'use strict';

/**
 * Fase 1.4 (parcial): Categorías/objetivo/equipamiento en routine
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const { DataTypes } = Sequelize;

      await queryInterface.addColumn('routine', 'category', {
        type: DataTypes.ENUM('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'FUNCTIONAL', 'MIXED'),
        allowNull: true
      }, { transaction }).catch(() => {});

      await queryInterface.addColumn('routine', 'target_goal', {
        type: DataTypes.ENUM('MUSCLE_GAIN', 'WEIGHT_LOSS', 'ENDURANCE', 'DEFINITION', 'GENERAL_FITNESS'),
        allowNull: true
      }, { transaction }).catch(() => {});

      await queryInterface.addColumn('routine', 'equipment_level', {
        type: DataTypes.ENUM('NO_EQUIPMENT', 'BASIC', 'FULL_GYM'),
        allowNull: true
      }, { transaction }).catch(() => {});

      await transaction.commit();
      console.log('✓ routine.category/target_goal/equipment_level creados');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error agregando clasificación a routine:', error.message);
      throw error;
    }
  },
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('routine', 'category', { transaction }).catch(() => {});
      await queryInterface.removeColumn('routine', 'target_goal', { transaction }).catch(() => {});
      await queryInterface.removeColumn('routine', 'equipment_level', { transaction }).catch(() => {});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

