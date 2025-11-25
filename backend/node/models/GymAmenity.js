const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymAmenity = sequelize.define('GymAmenity', {
  id_amenity: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Nombre de la amenidad (Ducha, Locker, WiFi, etc.)'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Categoría (FACILITY, SERVICE, EQUIPMENT)'
  },
  icon_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nombre del ícono para la UI'
  }
}, {
  tableName: 'gym_amenity',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = GymAmenity;

