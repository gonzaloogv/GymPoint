const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo para tokens de dispositivos (push notifications)
 * Tabla: user_device_tokens
 */
const UserDeviceToken = sequelize.define('UserDeviceToken', {
  id_device_token: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Usuario propietario del dispositivo'
  },
  platform: {
    type: DataTypes.ENUM('IOS', 'ANDROID', 'WEB'),
    allowNull: false,
    comment: 'Plataforma del dispositivo'
  },
  device_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID único del dispositivo (opcional)'
  },
  push_token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
    comment: 'Token de push notification (FCM, APNS, etc.)'
  },
  app_version: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Versión de la app'
  },
  os_version: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Versión del sistema operativo'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Token activo para recibir notificaciones'
  },
  last_seen_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Última vez que se usó este token'
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de revocación del token'
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
}, {
  tableName: 'user_device_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_device_tokens_push_token',
      unique: true,
      fields: ['push_token']
    },
    {
      name: 'idx_device_tokens_user_active',
      fields: ['id_user_profile', 'is_active']
    },
    {
      name: 'idx_device_tokens_platform_active',
      fields: ['platform', 'is_active']
    },
    {
      name: 'idx_device_tokens_last_seen',
      fields: ['last_seen_at']
    }
  ]
});

module.exports = UserDeviceToken;
