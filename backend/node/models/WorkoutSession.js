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
    allowNull: false,
    references: {
      model: 'user_profiles',
      key: 'id_user_profile'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  id_routine: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'routine',
      key: 'id_routine'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  id_routine_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'routine_day',
      key: 'id_routine_day'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
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
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['id_user_profile', 'status'],
      name: 'idx_workout_session_user_status'
    },
    {
      fields: ['started_at'],
      name: 'idx_workout_session_started'
    }
  ]
});

module.exports = WorkoutSession;
