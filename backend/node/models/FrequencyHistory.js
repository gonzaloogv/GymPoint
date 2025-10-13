const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FrequencyHistory = sequelize.define('FrequencyHistory', {
  id_history: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  week_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  week_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  goal: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  achieved: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  goal_met: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  tokens_earned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'frequency_history',
  timestamps: false
});

module.exports = FrequencyHistory;

