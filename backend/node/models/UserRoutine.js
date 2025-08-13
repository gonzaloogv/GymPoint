const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRoutine = sequelize.define(
  'UserRoutine',
  {
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    id_routine: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    finish_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: 'user_routine',
    timestamps: false,
  }
);

module.exports = UserRoutine;
