const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallenge = sequelize.define('DailyChallenge', {
  id_challenge: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  challenge_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
    comment: 'Fecha del desafío'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Título del desafío'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada'
  },
  challenge_type: {
    type: DataTypes.ENUM('MINUTES', 'EXERCISES', 'FREQUENCY', 'SETS', 'REPS'),
    allowNull: false,
    comment: 'Tipo de desafío'
  },
  target_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Valor objetivo a alcanzar'
  },
  target_unit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Unidad del objetivo'
  },
  tokens_reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: 'Tokens de recompensa'
  },
  difficulty: {
    type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
    allowNull: false,
    defaultValue: 'MEDIUM',
    comment: 'Nivel de dificultad'
  },
  id_template: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Template usado (si es auto-generado)'
  },
  auto_generated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si fue generado automáticamente'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Admin que lo creó (NULL si auto-generado)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si el desafío está activo'
  }
}, {
  tableName: 'daily_challenge',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['challenge_date', 'is_active'],
      name: 'idx_daily_challenge_date_active'
    }
  ]
});

module.exports = DailyChallenge;

// Las asociaciones se definen en index.js para evitar referencias circulares

