const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymSchedule = sequelize.define('GymSchedule', {
  id_schedule: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  day_of_week: {
    type: DataTypes.STRING(10),
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
  }
}, {
  tableName: 'gym_schedule',
  timestamps: false
});

module.exports = GymSchedule;
