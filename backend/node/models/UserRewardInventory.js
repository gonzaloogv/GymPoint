const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRewardInventory = sequelize.define('UserRewardInventory', {
  id_inventory: {
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
  item_type: {
    type: DataTypes.ENUM('streak_saver', 'token_multiplier'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  max_stack: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'user_reward_inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_user_reward_inventory_user',
      fields: ['id_user_profile'],
    },
    {
      name: 'idx_user_reward_inventory_type',
      fields: ['item_type'],
    },
  ],
});

module.exports = UserRewardInventory;
