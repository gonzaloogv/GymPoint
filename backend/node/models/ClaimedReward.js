const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClaimedReward = sequelize.define(
  'ClaimedReward',
  {
    id_claimed_reward: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    claimed_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: 'claimed_reward',
    timestamps: false,
  }
);

module.exports = ClaimedReward;
const Reward = require('./Reward');
ClaimedReward.belongsTo(Reward, {
  foreignKey: 'id_reward',
});

const RewardCode = require('./RewardCode');
ClaimedReward.belongsTo(RewardCode, {
  foreignKey: 'id_code',
});
