'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('user_body_metrics', {
      id_body_metric: {
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
      measured_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      weight_kg: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
      },
      height_cm: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
      },
      bmi: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
      },
      body_fat_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      muscle_mass_kg: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
      },
      waist_cm: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
      },
      hip_cm: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      source: {
        type: DataTypes.ENUM('MANUAL', 'SMART_SCALE', 'TRAINER'),
        allowNull: false,
        defaultValue: 'MANUAL'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('user_body_metrics', ['id_user_profile'], {
      name: 'idx_body_metrics_user'
    });

    await queryInterface.addIndex('user_body_metrics', ['measured_at'], {
      name: 'idx_body_metrics_measured_at'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('user_body_metrics', 'idx_body_metrics_measured_at');
    await queryInterface.removeIndex('user_body_metrics', 'idx_body_metrics_user');
    await queryInterface.dropTable('user_body_metrics');
  }
};
