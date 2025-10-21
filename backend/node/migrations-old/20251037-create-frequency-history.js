'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('frequency_history', {
      id_history: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_user_profile: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user_profiles',
          key: 'id_user_profile'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      week_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      week_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      goal: {
        type: DataTypes.TINYINT,
        allowNull: false
      },
      achieved: {
        type: DataTypes.TINYINT,
        allowNull: false
      },
      goal_met: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      tokens_earned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('frequency_history', ['id_user_profile', 'week_start_date'], {
      name: 'idx_frequency_history_user_date'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('frequency_history');
  }
};

