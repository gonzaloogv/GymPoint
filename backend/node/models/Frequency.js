const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Frequency = sequelize.define('Frequency', {
    id_frequency: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_user_profile: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Usuario al que pertenece la frecuencia'
    },
    goal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: 'Meta de asistencias por semana'
    },
    assist: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Asistencias en la semana actual'
    },
    achieved_goal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad de semanas con meta cumplida'
    },
    week_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Fecha de inicio de la semana actual'
    }
}, {
  tableName: 'frequency',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['id_user_profile'],
      name: 'idx_frequency_user'
    },
    {
      fields: ['week_start_date'],
      name: 'idx_frequency_week'
    }
  ]
});

module.exports = Frequency;

// Asociaciones definidas en models/index.js
