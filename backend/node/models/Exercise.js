const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  id_exercise: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  exercise_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del ejercicio'
  },
  muscular_group: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Grupo muscular principal'
  },
  secondary_muscles: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Músculos secundarios trabajados (array)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción del ejercicio'
  },
  equipment_needed: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Equipamiento necesario (array)'
  },
  difficulty_level: {
    type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    allowNull: true,
    comment: 'Nivel de dificultad'
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del video instructivo'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'user_profiles',
      key: 'id_user_profile'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Usuario creador (NULL = ejercicio del sistema)'
  }
}, {
  tableName: 'exercise',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      fields: ['muscular_group'],
      name: 'idx_exercise_muscle_group'
    },
    {
      fields: ['difficulty_level'],
      name: 'idx_exercise_difficulty'
    },
    {
      fields: ['deleted_at'],
      name: 'idx_exercise_deleted'
    }
  ]
});

module.exports = Exercise;

// Las asociaciones se definen en index.js para evitar referencias circulares
