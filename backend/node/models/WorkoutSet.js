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
    allowNull: false
  },
  id_exercise: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  set_number: {
    type: DataTypes.SMALLINT,
    allowNull: false
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  reps: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  rpe: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true
  },
  rest_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_warmup: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  performed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'workout_set',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = WorkoutSet;
