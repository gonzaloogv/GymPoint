'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('notification', {
      id_notification: {
        type: DataTypes.BIGINT,
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
      type: {
        type: DataTypes.ENUM(
          'REMINDER',
          'ACHIEVEMENT',
          'REWARD',
          'GYM_UPDATE',
          'PAYMENT',
          'SOCIAL',
          'SYSTEM'
        ),
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      action_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      icon: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      priority: {
        type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH'),
        allowNull: false,
        defaultValue: 'NORMAL'
      },
      scheduled_for: {
        type: DataTypes.DATE,
        allowNull: true
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
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

    await queryInterface.addIndex('notification', ['id_user_profile', 'is_read', 'created_at'], {
      name: 'idx_notification_user_unread'
    });

    await queryInterface.addIndex('notification', ['scheduled_for', 'sent_at'], {
      name: 'idx_notification_scheduled'
    });

    await queryInterface.createTable('user_notification_settings', {
      id_user_profile: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'user_profiles',
          key: 'id_user_profile'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      push_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      email_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      reminder_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      achievement_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      reward_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      gym_news_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      quiet_hours_start: {
        type: DataTypes.TIME,
        allowNull: true
      },
      quiet_hours_end: {
        type: DataTypes.TIME,
        allowNull: true
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('notification');
    await queryInterface.dropTable('user_notification_settings');
  }
};
