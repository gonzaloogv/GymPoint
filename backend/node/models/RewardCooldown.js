const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RewardCooldown = sequelize.define('RewardCooldown', {
  id_cooldown: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user_profiles',
      key: 'id_user_profile',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  id_reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reward',
      key: 'id_reward',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  last_claimed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  can_claim_again_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'reward_cooldown',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_reward_cooldown_user',
      fields: ['id_user_profile'],
    },
    {
      name: 'idx_reward_cooldown_time',
      fields: ['can_claim_again_at'],
    },
  ],
});

module.exports = RewardCooldown;
