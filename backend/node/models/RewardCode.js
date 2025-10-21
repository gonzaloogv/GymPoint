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
    allowNull: false,
    comment: 'Recompensa asociada al código'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Código único de la recompensa'
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si el código ya fue usado'
  }
}, {
  tableName: 'reward_code',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['code'],
      name: 'idx_reward_code_code'
    },
    {
      fields: ['id_reward', 'is_used'],
      name: 'idx_reward_code_reward_used'
    }
  ]
});

module.exports = RewardCode;

// Las asociaciones se definen en index.js para evitar referencias circulares