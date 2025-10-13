const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBodyMetric = sequelize.define('UserBodyMetric', {
  id_body_metric: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  measured_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  weight_kg: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  height_cm: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  bmi: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  body_fat_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  muscle_mass_kg: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  waist_cm: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  hip_cm: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  source: {
    type: DataTypes.ENUM('MANUAL', 'SMART_SCALE', 'TRAINER'),
    allowNull: false,
    defaultValue: 'MANUAL'
  }
}, {
  tableName: 'user_body_metrics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserBodyMetric;
