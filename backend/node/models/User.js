// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id_user: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  gender: { type: DataTypes.STRING(1), allowNull: false },
  age: { type: DataTypes.TINYINT, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  subscription: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'FREE' },
  tokens: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'user',
  timestamps: false
});

module.exports = User;
const Routine = require('./Routine');
const UserRoutine = require('./UserRoutine');

User.belongsToMany(Routine, {
  through: UserRoutine,
  foreignKey: 'id_user',
  otherKey: 'id_routine'
});
const Reward = require('./Reward');
const ClaimedReward = require('./ClaimedReward');

User.belongsToMany(Reward, {
  through: ClaimedReward,
  foreignKey: 'id_user',
  otherKey: 'id_reward'
});
