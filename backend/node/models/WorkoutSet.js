const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutSet = sequelize.define('WorkoutSet', {
  id_workout_set: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_workout_session: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workout_session',
      key: 'id_workout_session'
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
  set_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número de serie del ejercicio'
  },
  reps: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    field: 'weight_kg' // Maps 'weight' in code to 'weight_kg' in database
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Para ejercicios de tiempo'
  },
  rest_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_pr: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si es un récord personal'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'workout_set',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['id_workout_session'],
      name: 'idx_workout_set_session'
    },
    {
      fields: ['id_exercise', 'is_pr'],
      name: 'idx_workout_set_exercise_pr'
    }
  ]
});

module.exports = WorkoutSet;
