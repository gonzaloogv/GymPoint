const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Routine = sequelize.define('Routine', {
  id_routine: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  routine_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  created_by: {  // antes: id_user
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'routine',
  timestamps: false
});

module.exports = Routine;

// Relaciones con ejercicios
const Exercise = require('./Exercise');
const RoutineExercise = require('./RoutineExercise');

Routine.belongsToMany(Exercise, {
  through: RoutineExercise,
  foreignKey: 'id_routine',
  otherKey: 'id_exercise'
});

// Asociaciones definidas en models/index.js
