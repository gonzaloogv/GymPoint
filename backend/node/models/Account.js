const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Account - Autenticación
 * 
 * Representa una cuenta de usuario en el sistema.
 * Separado de los perfiles de dominio (UserProfile, AdminProfile).
 * 
 * Relaciones:
 * - 1:N con AccountRole (un account puede tener múltiples roles)
 * - 1:1 con UserProfile (si tiene rol USER)
 * - 1:1 con AdminProfile (si tiene rol ADMIN)
 * - 1:N con RefreshToken
 */
const Account = sequelize.define('Account', {
  id_account: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único de la cuenta'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: 'Email único para login'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Hash de contraseña (NULL si es login social)'
  },
  auth_provider: {
    type: DataTypes.ENUM('local', 'google'),
    allowNull: false,
    defaultValue: 'local',
    comment: 'Proveedor de autenticación'
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    comment: 'ID de Google OAuth'
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si el email está verificado'
  },
  email_verification_deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha límite para verificar email (período de gracia de 7 días)'
  },
  profile_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si el usuario completó el onboarding inicial (frecuencia, fecha nacimiento, género)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si la cuenta está activa (no baneada)'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Última fecha de login'
  }
}, {
  tableName: 'accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['google_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Account;

