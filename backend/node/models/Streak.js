const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Streak = sequelize.define('Streak', {
  id_streak: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_frequency: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  last_value: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  recovery_items: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }  
}, {
  tableName: 'streak',
  timestamps: false
});

module.exports = Streak;
