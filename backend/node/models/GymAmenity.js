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
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('FACILITY', 'SERVICE', 'SAFETY', 'EXTRA'),
    allowNull: false,
    defaultValue: 'FACILITY'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'gym_amenity',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = GymAmenity;

