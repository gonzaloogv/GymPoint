'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('user_profiles', 'birth_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      }, { transaction });
      await transaction.commit();
      console.log('✓ user_profiles.birth_date agregado');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error agregando birth_date:', error.message);
      throw error;
    }
  },
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('user_profiles', 'birth_date', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

