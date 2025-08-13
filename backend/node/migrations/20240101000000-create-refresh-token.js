'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('refresh_token', {
      id_token: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      id_user: { type: Sequelize.INTEGER, allowNull: false },
      token_hash: { type: Sequelize.STRING(64), allowNull: false },
      user_agent: { type: Sequelize.STRING },
      ip_address: { type: Sequelize.STRING },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      revoked: { type: Sequelize.BOOLEAN, defaultValue: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('refresh_token');
  },
};
