const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserNotificationSetting = sequelize.define('UserNotificationSetting', {
  id_user_profile: {
    type: DataTypes.INTEGER,
    primaryKey: true
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
  }
}, {
  tableName: 'user_notification_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserNotificationSetting;

