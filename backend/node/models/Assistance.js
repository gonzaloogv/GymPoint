const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assistance = sequelize.define('Assistance', {
  id_assistance: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hour: {
    type: DataTypes.TIME,
    allowNull: false
  },
  check_in_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  check_out_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_streak: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'assistance',
  timestamps: false
});

module.exports = Assistance;

// Las asociaciones se definen en index.js para evitar referencias circulares
