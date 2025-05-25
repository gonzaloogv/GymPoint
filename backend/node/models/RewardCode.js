const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RewardCode = sequelize.define('RewardCode', {
  id_code: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_reward: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  expiration_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  used: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  creation_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'reward_code',
  timestamps: false
});

module.exports = RewardCode;
const Reward = require('./Reward');
const Gym = require('./Gym');

RewardCode.belongsTo(Reward, { 
    foreignKey: 'id_reward' 
});
RewardCode.belongsTo(Gym, { 
    foreignKey: 'id_gym' 
});
