const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id_transaction: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  movement_type: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  id_reward: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  result_balance: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  motive: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'transaction',
  timestamps: false
});

module.exports = Transaction;

// Relaciones con alias en minúsculas (lazy loading para evitar ciclos)
// Las asociaciones se definen en index.js para evitar referencias circulares
