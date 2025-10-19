const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallengeTemplate = sequelize.define('DailyChallengeTemplate', {
  id_template: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
  rotation_weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'daily_challenge_template',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DailyChallengeTemplate;

