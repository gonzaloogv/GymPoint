const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define(
  'Transaction',
  {
    id_transaction: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    movement_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    id_reward: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    result_balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motive: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'transaction',
    timestamps: false,
  }
);

module.exports = Transaction;

// Relaciones
const Reward = require('./Reward');
const User = require('./User');

Transaction.belongsTo(User, { foreignKey: 'id_user' });
Transaction.belongsTo(Reward, { foreignKey: 'id_reward' });

User.hasMany(Transaction, { foreignKey: 'id_user' });
Reward.hasMany(Transaction, { foreignKey: 'id_reward' });
