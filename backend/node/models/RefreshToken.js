const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    id_token: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    user_agent: {
      type: DataTypes.STRING,
    },
    ip_address: {
      type: DataTypes.STRING,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'refresh_token',
    timestamps: false,
  }
);
// Asociación directa (opcional si no usás `models/index.js`)
const User = require('./User');
RefreshToken.belongsTo(User, { foreignKey: 'id_user', as: 'user' });

module.exports = RefreshToken;
