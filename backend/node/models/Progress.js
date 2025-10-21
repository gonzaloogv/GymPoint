const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Progress = sequelize.define('Progress', {
  id_progress: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_weight_lifted: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  total_reps: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_sets: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'progress',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id_user_profile', 'date'],
      name: 'idx_progress_user_date'
    }
  ]
});

const Exercise = require('./Exercise');
const ProgressExercise = require('./ProgressExercise');

module.exports = Progress;
Progress.belongsToMany(Exercise, {
  through: ProgressExercise,
  foreignKey: 'id_progress',
  otherKey: 'id_exercise'
});