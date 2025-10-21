const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserGym = sequelize.define('UserGym', {
  id_user_gym: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Usuario suscrito al gimnasio'
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Gimnasio al que está suscrito'
  },
  subscription_plan: {
    type: DataTypes.ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL'),
    allowNull: true,
    comment: 'Tipo de plan contratado'
  },
  subscription_start: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Inicio de la suscripción'
  },
  subscription_end: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fin de la suscripción'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si la suscripción está activa'
  }
}, {
  tableName: 'user_gym',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_user_profile', 'id_gym'],
      name: 'idx_user_gym_user_gym'
    },
    {
      fields: ['is_active', 'subscription_end'],
      name: 'idx_user_gym_active_end'
    }
  ]
});

module.exports = UserGym;

// Asociaciones definidas en models/index.js
