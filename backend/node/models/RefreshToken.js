const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id_refresh_token: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    comment: 'ID único del refresh token'
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id_account'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Cuenta asociada'
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
    comment: 'Refresh token JWT'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de expiración'
  },
  is_revoked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si el token ha sido revocado'
  }
}, {
  tableName: 'refresh_token',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['id_account'],
      name: 'idx_refresh_token_account'
    },
    {
      unique: true,
      fields: ['token'],
      name: 'idx_refresh_token_token'
    },
    {
      fields: ['expires_at', 'is_revoked'],
      name: 'idx_refresh_token_expiration'
    }
  ]
});

// Instance methods
RefreshToken.prototype.isExpired = function() {
  return new Date() > new Date(this.expires_at);
};

RefreshToken.prototype.isValid = function() {
  return !this.is_revoked && !this.isExpired();
};

module.exports = RefreshToken;

// Las asociaciones se definen en index.js para evitar referencias circulares
