'use strict';

/**
 * Expandir routine.description a 500 caracteres (alineado al diccionario de datos)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('routine', 'description', {
        type: Sequelize.STRING(500),
        allowNull: true
      }, { transaction });
      await transaction.commit();
      console.log('✓ routine.description ahora VARCHAR(500)');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error expandiendo routine.description:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('routine', 'description', {
        type: Sequelize.STRING(250),
        allowNull: true
      }, { transaction });
      await transaction.commit();
      console.log('✓ routine.description revertida a VARCHAR(250)');
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Error revirtiendo routine.description:', error.message);
      throw error;
    }
  }
};

