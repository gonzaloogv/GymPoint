'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;
    await queryInterface.addColumn('gym', 'rules', {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Listado de reglas de convivencia (array de strings)'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('gym', 'rules');
  }
};
