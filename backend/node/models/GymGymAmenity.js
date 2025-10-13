const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymGymAmenity = sequelize.define('GymGymAmenity', {
  id_gym_amenity: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_amenity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'gym_gym_amenity',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = GymGymAmenity;

