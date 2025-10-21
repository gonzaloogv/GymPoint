const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBodyMetric = sequelize.define('UserBodyMetric', {
  id_metric: {
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
  weight_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  height_cm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  body_fat_percentage: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  muscle_mass_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  bmi: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Índice de masa corporal'
  },
  waist_cm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  chest_cm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  arms_cm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'user_body_metrics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['id_user_profile', 'date'],
      name: 'idx_body_metrics_user_date'
    }
  ]
});

module.exports = UserBodyMetric;
