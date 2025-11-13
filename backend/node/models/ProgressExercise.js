const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgressExercise = sequelize.define('ProgressExercise', {
  id_progress_exercise: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'progress',
      key: 'id_progress'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  id_exercise: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exercise',
      key: 'id_exercise'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  max_weight: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'Peso máximo levantado (PR)'
  },
  max_reps: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Repeticiones máximas'
  },
  total_volume: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Volumen total (peso × reps × series)'
  }
}, {
  tableName: 'progress_exercise',
  timestamps: false,
  indexes: [
    {
      fields: ['id_progress'],
      name: 'idx_progress_exercise_progress'
    },
    {
      fields: ['id_exercise', 'max_weight'],
      name: 'idx_progress_exercise_max'
    }
  ]
});

module.exports = ProgressExercise;
