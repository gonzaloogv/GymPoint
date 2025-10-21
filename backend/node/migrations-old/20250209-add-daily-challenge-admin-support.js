'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    // Tabla de plantillas de desafíos diarios
    await queryInterface.createTable('daily_challenge_template', {
      id_template: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      challenge_type: {
        type: DataTypes.ENUM('MINUTES', 'EXERCISES', 'FREQUENCY'),
        allowNull: false
      },
      target_value: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      target_unit: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      tokens_reward: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      difficulty: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'MEDIUM'
      },
      rotation_weight: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'user_profiles',
          key: 'id_user_profile'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
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

    // Agregar columnas a daily_challenge
    await queryInterface.addColumn('daily_challenge', 'id_template', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'daily_challenge_template',
        key: 'id_template'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      after: 'difficulty'
    });

    await queryInterface.addColumn('daily_challenge', 'auto_generated', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'id_template'
    });

    await queryInterface.addColumn('daily_challenge', 'created_by', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user_profiles',
        key: 'id_user_profile'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      after: 'auto_generated'
    });

    // Tabla de configuración
    await queryInterface.createTable('daily_challenge_settings', {
      id_config: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1
      },
      auto_rotation_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      rotation_cron: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: '1 0 * * *'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.bulkInsert('daily_challenge_settings', [{
      id_config: 1,
      auto_rotation_enabled: true,
      rotation_cron: '1 0 * * *',
      updated_at: new Date()
    }], { ignoreDuplicates: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('daily_challenge_settings');

    await queryInterface.removeColumn('daily_challenge', 'created_by');
    await queryInterface.removeColumn('daily_challenge', 'auto_generated');
    await queryInterface.removeColumn('daily_challenge', 'id_template');

    await queryInterface.dropTable('daily_challenge_template');
  }
};

