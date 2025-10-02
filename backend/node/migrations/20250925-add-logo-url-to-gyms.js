// backend/node/migrations/20250925-add-logo-url-to-gyms.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('gyms', 'logo_url', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('gyms', 'logo_url');
  },
};
