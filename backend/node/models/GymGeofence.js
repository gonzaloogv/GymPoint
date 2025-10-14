const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymGeofence = sequelize.define('GymGeofence', {
  id_geofence: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  radius_meters: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 150
  },
  auto_checkin_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  min_stay_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'gym_geofence',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = GymGeofence;

