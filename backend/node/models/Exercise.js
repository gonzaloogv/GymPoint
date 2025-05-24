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
    allowNull: false
  },
  muscular_group: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'exercise',
  timestamps: false
});

module.exports = Exercise;
const Routine = require('./Routine');
const RoutineExercise = require('./RoutineExercise');
Exercise.belongsToMany(Routine, {
  through: RoutineExercise,
  foreignKey: 'id_exercise',
  otherKey: 'id_routine'
});

const Progress = require('./Progress');
const ProgressExercise = require('./ProgressExercise');
Exercise.belongsToMany(Progress, {
    through: ProgressExercise,
    foreignKey: 'id_exercise',
    otherKey: 'id_progress'
  });