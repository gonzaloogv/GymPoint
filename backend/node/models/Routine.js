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
    type: DataTypes.STRING(500),
    allowNull: true
  },
  created_by: {  // antes: id_user
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_template: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  recommended_for: {
    type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    allowNull: true
  },
  template_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  category: {
    type: DataTypes.ENUM('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'FUNCTIONAL', 'MIXED'),
    allowNull: true
  },
  target_goal: {
    type: DataTypes.ENUM('MUSCLE_GAIN', 'WEIGHT_LOSS', 'ENDURANCE', 'DEFINITION', 'GENERAL_FITNESS'),
    allowNull: true
  },
  equipment_level: {
    type: DataTypes.ENUM('NO_EQUIPMENT', 'BASIC', 'FULL_GYM'),
    allowNull: true
  }
}, {
  tableName: 'routine',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
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
