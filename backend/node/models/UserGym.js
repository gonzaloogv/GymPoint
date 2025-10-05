const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserGym = sequelize.define('UserGym', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  id_gym: {
    type: DataTypes.INTEGER,
    primaryKey: true,
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
  timestamps: false
});

module.exports = UserGym;

