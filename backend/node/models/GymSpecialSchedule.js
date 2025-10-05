const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymSpecialSchedule = sequelize.define('GymSpecialSchedule', {
  id_special: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  opening_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  closing_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  closed: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  motive: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'gym_special_schedule',
  timestamps: false
});

module.exports = GymSpecialSchedule;
