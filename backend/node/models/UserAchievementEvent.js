const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAchievementEvent = sequelize.define('UserAchievementEvent', {
  id_user_achievement_event: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_achievement: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  event_type: {
    type: DataTypes.ENUM('PROGRESS', 'UNLOCKED', 'RESET'),
    allowNull: false
  },
  delta: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  snapshot_value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  source_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  source_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_achievement_event',
  timestamps: false,
  indexes: [
    {
      fields: ['id_user_achievement', 'created_at'],
      name: 'idx_user_achievement_event_timeline'
    }
  ]
});

UserAchievementEvent.EVENT_TYPES = {
  PROGRESS: 'PROGRESS',
  UNLOCKED: 'UNLOCKED',
  RESET: 'RESET'
};

module.exports = UserAchievementEvent;

