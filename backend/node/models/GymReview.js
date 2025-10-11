const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const GymReview = sequelize.define('GymReview', {
  id_review: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cleanliness_rating: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  equipment_rating: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  staff_rating: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  value_rating: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  reported: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'gym_review',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});
module.exports = GymReview;