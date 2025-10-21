'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const { DataTypes } = Sequelize;
      // Asegurar que routine.created_by permita NULL
      await queryInterface.changeColumn('routine', 'created_by', {
        type: DataTypes.INTEGER,
        allowNull: true
      }, { transaction });
      await transaction.commit();
      console.log('✓ routine.created_by ahora permite NULL');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error cambiando routine.created_by:', error.message);
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const { DataTypes } = Sequelize;
      // No forzamos NOT NULL en rollback por seguridad
      await queryInterface.changeColumn('routine', 'created_by', {
        type: DataTypes.INTEGER,
        allowNull: true
      }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

