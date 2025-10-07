const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserGym = sequelize.define('UserGym', {
  id_user_gym: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  finish_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  plan: {
    type: DataTypes.ENUM('MENSUAL', 'SEMANAL', 'ANUAL'),
    allowNull: false,
    defaultValue: 'MENSUAL'
  }
}, {
  tableName: 'user_gym',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_user', 'id_gym', 'active'],
      where: { active: true },
      name: 'unique_active_gym'
    }
  ]
});

module.exports = UserGym;

// Asociaciones definidas en models/index.js

