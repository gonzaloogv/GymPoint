'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('exercise', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'muscular_group'
    });

    await queryInterface.addColumn('exercise', 'equipment_needed', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'description'
    });

    await queryInterface.addColumn('exercise', 'difficulty', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'equipment_needed'
    });

    await queryInterface.addColumn('exercise', 'instructions', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'difficulty'
    });

    await queryInterface.addColumn('exercise', 'video_url', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'instructions'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('exercise', 'video_url');
    await queryInterface.removeColumn('exercise', 'instructions');
    await queryInterface.removeColumn('exercise', 'difficulty');
    await queryInterface.removeColumn('exercise', 'equipment_needed');
    await queryInterface.removeColumn('exercise', 'description');
  }
};

