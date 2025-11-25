const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoutineExercise = sequelize.define('RoutineExercise', {
  id_routine_exercise: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_routine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'routine',
      key: 'id_routine'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Rutina a la que pertenece el ejercicio'
  },
  id_routine_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'routine_day',
      key: 'id_routine_day'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Día de la rutina (NULL para rutinas sin días específicos)'
  },
  id_exercise: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exercise',
      key: 'id_exercise'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Ejercicio asignado'
  },
  exercise_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Orden del ejercicio en el día'
  },
  sets: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Número de series sugeridas'
  },
  reps: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Número de repeticiones sugeridas'
  },
  rest_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Descanso entre series en segundos'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del ejercicio'
  }
}, {
  tableName: 'routine_exercise',
  timestamps: false,
  indexes: [
    {
      fields: ['id_routine'],
      name: 'idx_routine_exercise_routine'
    },
    {
      fields: ['id_routine_day', 'exercise_order'],
      name: 'idx_routine_exercise_day_order'
    },
    {
      fields: ['id_exercise'],
      name: 'idx_routine_exercise_exercise'
    }
  ]
});

module.exports = RoutineExercise;

// Las asociaciones se definen en index.js para evitar referencias circulares
