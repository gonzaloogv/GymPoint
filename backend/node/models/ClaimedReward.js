const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClaimedReward = sequelize.define('ClaimedReward', {
  id_claimed_reward: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_reward: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  claimed_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'redeemed', 'revoked'),
    allowNull: false
  },
  provider_snapshot: {
    type: DataTypes.ENUM('system', 'gym'),
    allowNull: true
  },
  gym_id_snapshot: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  tableName: 'claimed_reward',
  timestamps: false
});

module.exports = ClaimedReward;

// Las asociaciones se definen en index.js para evitar referencias circulares

