const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AchievementDefinition = sequelize.define('AchievementDefinition', {
  id_achievement_definition: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'ONBOARDING',
      'STREAK',
      'FREQUENCY',
      'ATTENDANCE',
      'ROUTINE',
      'CHALLENGE',
      'PROGRESS',
      'TOKEN',
      'SOCIAL'
    ),
    allowNull: false,
    defaultValue: 'ONBOARDING'
  },
  metric_type: {
    type: DataTypes.ENUM(
      'STREAK_DAYS',
      'STREAK_RECOVERY_USED',
      'ASSISTANCE_TOTAL',
      'FREQUENCY_WEEKS_MET',
      'ROUTINE_COMPLETED_COUNT',
      'WORKOUT_SESSION_COMPLETED',
      'DAILY_CHALLENGE_COMPLETED_COUNT',
      'PR_RECORD_COUNT',
      'BODY_WEIGHT_PROGRESS',
      'TOKEN_BALANCE_REACHED',
      'TOKEN_SPENT_TOTAL',
      'ONBOARDING_STEP_COMPLETED'
    ),
    allowNull: false
  },
  target_value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'achievement_definition',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

AchievementDefinition.CATEGORIES = {
  ONBOARDING: 'ONBOARDING',
  STREAK: 'STREAK',
  FREQUENCY: 'FREQUENCY',
  ATTENDANCE: 'ATTENDANCE',
  ROUTINE: 'ROUTINE',
  CHALLENGE: 'CHALLENGE',
  PROGRESS: 'PROGRESS',
  TOKEN: 'TOKEN',
  SOCIAL: 'SOCIAL'
};

AchievementDefinition.METRIC_TYPES = {
  STREAK_DAYS: 'STREAK_DAYS',
  STREAK_RECOVERY_USED: 'STREAK_RECOVERY_USED',
  ASSISTANCE_TOTAL: 'ASSISTANCE_TOTAL',
  FREQUENCY_WEEKS_MET: 'FREQUENCY_WEEKS_MET',
  ROUTINE_COMPLETED_COUNT: 'ROUTINE_COMPLETED_COUNT',
  WORKOUT_SESSION_COMPLETED: 'WORKOUT_SESSION_COMPLETED',
  DAILY_CHALLENGE_COMPLETED_COUNT: 'DAILY_CHALLENGE_COMPLETED_COUNT',
  PR_RECORD_COUNT: 'PR_RECORD_COUNT',
  BODY_WEIGHT_PROGRESS: 'BODY_WEIGHT_PROGRESS',
  TOKEN_BALANCE_REACHED: 'TOKEN_BALANCE_REACHED',
  TOKEN_SPENT_TOTAL: 'TOKEN_SPENT_TOTAL',
  ONBOARDING_STEP_COMPLETED: 'ONBOARDING_STEP_COMPLETED'
};

module.exports = AchievementDefinition;

