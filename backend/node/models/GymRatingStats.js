const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymRatingStats = sequelize.define('GymRatingStats', {
  id_gym: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'gym',
      key: 'id_gym'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  avg_rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rating_5_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rating_4_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rating_3_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rating_2_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rating_1_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  avg_cleanliness: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0
  },
  avg_equipment: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0
  },
  avg_staff: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0
  },
  avg_value: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0
  },
  last_review_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'gym_rating_stats',
  timestamps: false,
  indexes: [
    {
      fields: ['avg_rating'],
      name: 'idx_gym_stats_rating'
    }
  ]
});

module.exports = GymRatingStats;