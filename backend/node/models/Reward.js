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
  // Alias para facilitar queries
  cost: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('cost_tokens');
    }
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

// Las asociaciones se definen en index.js para evitar referencias circulares

