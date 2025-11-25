const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FrequencyHistory = sequelize.define('FrequencyHistory', {
  id_history: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Referencia al perfil de usuario'
  },
  week_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Inicio de la semana'
  },
  week_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fin de la semana'
  },
  goal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Meta de la semana'
  },
  achieved: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Asistencias logradas'
  },
  goal_met: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si se cumplió la meta'
  }
}, {
  tableName: 'frequency_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id_user_profile', 'week_start_date'],
      name: 'idx_frequency_history_user_week'
    }
  ]
});

module.exports = FrequencyHistory;

// Las asociaciones se definen en index.js para evitar referencias circulares

