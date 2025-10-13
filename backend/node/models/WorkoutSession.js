const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutSession = sequelize.define('WorkoutSession', {
  id_workout_session: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_routine: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_routine_day: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'IN_PROGRESS'
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_sets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_reps: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_weight: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'workout_session',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = WorkoutSession;
