const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallengeTemplate = sequelize.define('DailyChallengeTemplate', {
  id_template: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  challenge_type: {
    type: DataTypes.ENUM('MINUTES', 'EXERCISES', 'FREQUENCY'),
    allowNull: false
  },
  target_value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target_unit: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tokens_reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  difficulty: {
    type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
    allowNull: false,
    defaultValue: 'MEDIUM',
    comment: 'Nivel de dificultad del desafío'
  },
  rotation_weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Peso para rotación automática de desafíos'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si la plantilla está activa'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admin_profiles',
      key: 'id_admin_profile'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Admin que creó la plantilla'
  }
}, {
  tableName: 'daily_challenge_template',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DailyChallengeTemplate;

