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
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  locality: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  app_tier: {
    type: DataTypes.ENUM('FREE', 'PREMIUM'),
    allowNull: false,
    defaultValue: 'FREE',
    comment: 'Tier de la aplicación (FREE o PREMIUM)'
  },
  premium_since: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha desde que el usuario es premium'
  },
  premium_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de expiración del premium'
  },
  tokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Tokens acumulados'
  },
  profile_picture_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la foto de perfil'
  }
}, {
  tableName: 'user_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false,
  indexes: [
    {
      unique: true,
      fields: ['id_account'],
      name: 'idx_user_profiles_account'
    },
    {
      fields: ['app_tier'],
      name: 'idx_user_profiles_app_tier'
    },
    {
      fields: ['premium_expires'],
      name: 'idx_user_profiles_premium_expires'
    },
    {
      fields: ['tokens'],
      name: 'idx_user_profiles_tokens'
    }
  ]
});

// Constantes de app tier
UserProfile.APP_TIERS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM'
};

module.exports = UserProfile;
