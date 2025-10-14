const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallenge = sequelize.define('DailyChallenge', {
  id_challenge: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  challenge_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  challenge_type: {
    type: DataTypes.ENUM('MINUTES', 'EXERCISES', 'FREQUENCY'),
    allowNull: false
  },
  target_value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target_unit: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tokens_reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'MEDIUM'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'daily_challenge',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DailyChallenge;

