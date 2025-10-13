'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('account_deletion_request', {
      id_request: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_account: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id_account'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      scheduled_deletion_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'CANCELLED', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      requested_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      }
    });

    await queryInterface.addIndex('account_deletion_request', ['status', 'scheduled_deletion_date'], {
      name: 'idx_account_deletion_status_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('account_deletion_request', 'idx_account_deletion_status_date');
    await queryInterface.dropTable('account_deletion_request');
  }
};
