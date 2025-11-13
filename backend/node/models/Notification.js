const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id_notification: {
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
  type: {
    type: DataTypes.ENUM(
      'REMINDER',
      'ACHIEVEMENT',
      'REWARD',
      'GYM_UPDATE',
      'PAYMENT',
      'SOCIAL',
      'SYSTEM',
      'CHALLENGE'
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
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales (deep links, etc.)'
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH'),
    allowNull: false,
    defaultValue: 'NORMAL'
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
  scheduled_for: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha programada de envío'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha real de envío'
  }
}, {
  tableName: 'notification',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['id_user_profile', 'is_read', 'created_at'],
      name: 'idx_notification_user_read'
    },
    {
      fields: ['scheduled_for', 'sent_at'],
      name: 'idx_notification_scheduled'
    },
    {
      fields: ['type'],
      name: 'idx_notification_type'
    }
  ]
});

module.exports = Notification;

