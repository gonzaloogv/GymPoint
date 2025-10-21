'use strict';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('user_profiles', 'age', { transaction });
      await transaction.commit();
      console.log('✓ user_profiles.age eliminado');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error eliminando age:', error.message);
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('user_profiles', 'age', {
        type: Sequelize.TINYINT,
        allowNull: true
      }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

