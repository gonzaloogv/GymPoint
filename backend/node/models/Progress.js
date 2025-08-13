const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Progress = sequelize.define(
  'Progress',
  {
    id_progress: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    body_weight: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    body_fat: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
  },
  {
    tableName: 'progress',
    timestamps: false,
  }
);

const Exercise = require('./Exercise');
const ProgressExercise = require('./ProgressExercise');

module.exports = Progress;
Progress.belongsToMany(Exercise, {
  through: ProgressExercise,
  foreignKey: 'id_progress',
  otherKey: 'id_exercise',
});
