'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const cols = await queryInterface.describeTable('routine');
      if (!cols.created_at) {
        await queryInterface.addColumn('routine', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }, { transaction });
      }
      if (!cols.updated_at) {
        await queryInterface.addColumn('routine', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }, { transaction });
      }
      await transaction.commit();
      console.log('✓ Timestamps añadidos a routine');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error agregando timestamps a routine:', error.message);
      throw error;
    }
  },
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const cols = await queryInterface.describeTable('routine');
      if (cols.created_at) await queryInterface.removeColumn('routine', 'created_at', { transaction });
      if (cols.updated_at) await queryInterface.removeColumn('routine', 'updated_at', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

