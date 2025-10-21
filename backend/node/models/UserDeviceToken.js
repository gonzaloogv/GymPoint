const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserDeviceToken = sequelize.define('UserDeviceToken', {
  id_device_token: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
    comment: 'Token del dispositivo (FCM, APNS)'
  },
  platform: {
    type: DataTypes.ENUM('IOS', 'ANDROID', 'WEB'),
    allowNull: false
  },
  device_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID único del dispositivo'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  last_used_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_device_token',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['id_user_profile', 'is_active'],
      name: 'idx_device_token_user_active'
    },
    {
      unique: true,
      fields: ['token'],
      name: 'idx_device_token_token'
    }
  ]
});

module.exports = UserDeviceToken;
