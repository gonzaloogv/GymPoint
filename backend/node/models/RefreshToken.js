const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Tu instancia de Sequelize

const RefreshToken = sequelize.define('RefreshToken', {
  id_token: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  user_agent: {
    type: DataTypes.STRING
  },
  ip_address: {
    type: DataTypes.STRING
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'refresh_token',
  timestamps: false // Cambiá a true si querés createdAt/updatedAt
});

// Asociación directa (opcional si no usás `models/index.js`)
const User = require('./User');
RefreshToken.belongsTo(User, { foreignKey: 'id_user', as: 'user' });

module.exports = RefreshToken;
