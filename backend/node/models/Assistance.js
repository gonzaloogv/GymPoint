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
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_streak: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'assistance',
  timestamps: false
});

module.exports = Assistance;
