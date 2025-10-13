const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoutineExercise = sequelize.define('RoutineExercise', {
  id_routine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  id_exercise: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  series: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  reps: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  order: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  id_routine_day: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'routine_exercise',
  timestamps: false
});

module.exports = RoutineExercise;
