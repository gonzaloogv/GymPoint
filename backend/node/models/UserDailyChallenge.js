const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserDailyChallenge = sequelize.define('UserDailyChallenge', {
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  id_challenge: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tokens_earned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'user_daily_challenge',
  timestamps: false,
  indexes: [
    { fields: ['id_user_profile', 'completed', 'completed_at'], name: 'idx_completed' }
  ]
});

module.exports = UserDailyChallenge;

