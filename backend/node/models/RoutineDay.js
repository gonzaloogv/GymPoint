const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoutineDay = sequelize.define('RoutineDay', {
  id_routine_day: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_routine: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  day_number: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'routine_day',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RoutineDay;
