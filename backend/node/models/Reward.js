const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reward = sequelize.define('Reward', {
  id_reward: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(250),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  cost_tokens: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  available: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  finish_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  creation_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'reward',
  timestamps: false
});

module.exports = Reward;

// Relaciones
const ClaimedReward = require('./ClaimedReward');
const Transaction = require('./Transaction');
const User = require('./User');

Reward.hasMany(ClaimedReward, { foreignKey: 'id_reward' });
Reward.hasMany(Transaction, { foreignKey: 'id_reward' });

Reward.belongsToMany(User, {
  through: ClaimedReward,
  foreignKey: 'id_reward',
  otherKey: 'id_user'
});

const RewardCode = require('./RewardCode');
Reward.hasMany(RewardCode, { 
  foreignKey: 'id_reward' 
});

