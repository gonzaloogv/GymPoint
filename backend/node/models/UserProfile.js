const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo UserProfile - Perfil de Usuario de la App
 * 
 * Datos de dominio para usuarios de la aplicación móvil.
 * Separado de Account (autenticación).
 * 
 * Relaciones:
 * - 1:1 con Account
 * - 1:N con Assistance
 * - 1:N con Progress
 * - 1:N con Transaction
 * - 1:N con UserGym
 * - 1:N con UserRoutine
 * - 1:N con ClaimedReward
 * - 1:N con GymPayment
 * - 1:1 con Streak
 * - 1:1 con Frequency
 * - 1:N con Routine (como creator)
 */
const UserProfile = sequelize.define('UserProfile', {
  id_user_profile: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'accounts',
      key: 'id_account'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Relación 1:1 con account'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('M', 'F', 'O'),
    allowNull: false,
    defaultValue: 'O'
  },
  age: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  locality: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  subscription: {
    type: DataTypes.ENUM('FREE', 'PREMIUM'),
    allowNull: false,
    defaultValue: 'FREE',
    comment: 'Nivel de suscripción del usuario'
  },
  tokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Tokens acumulados'
  },
  id_streak: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Racha actual del usuario'
  },
  profile_picture_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'user_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_account']
    },
    {
      fields: ['subscription']
    },
    {
      fields: ['tokens']
    }
  ]
});

// Constantes de subscripción
UserProfile.SUBSCRIPTIONS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM'
};

module.exports = UserProfile;

