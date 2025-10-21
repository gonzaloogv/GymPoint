const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Streak = sequelize.define('Streak', {
  id_streak: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Usuario al que pertenece la racha'
  },
  id_frequency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Frecuencia asociada'
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Racha actual (días consecutivos)'
  },
  last_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Última racha (antes de perderla)'
  },
  max_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Racha máxima histórica'
  },
  recovery_items: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Ítems de recuperación de racha disponibles'
  },
  last_assistance_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha de la última asistencia'
  }
}, {
  tableName: 'streak',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['id_user_profile'],
      name: 'idx_streak_user'
    },
    {
      fields: ['id_frequency'],
      name: 'idx_streak_frequency'
    },
    {
      fields: ['value'],
      name: 'idx_streak_value'
    }
  ]
});

module.exports = Streak;

// Las asociaciones se definen en index.js para evitar referencias circulares
