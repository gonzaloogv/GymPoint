const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewHelpful = sequelize.define('ReviewHelpful', {
  id_review: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gym_review',
      key: 'id_review'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
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
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'review_helpful',
  timestamps: false
});

module.exports = ReviewHelpful;