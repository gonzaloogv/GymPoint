const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgressExercise = sequelize.define('ProgressExercise', {
  id_progress: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  id_exercise: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  used_weight: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reps: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'progress_exercise',
  timestamps: false
});

module.exports = ProgressExercise;
