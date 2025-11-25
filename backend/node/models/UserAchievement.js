const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAchievement = sequelize.define('UserAchievement', {
  id_user_achievement: {
    type: DataTypes.BIGINT,
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
  id_achievement_definition: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'achievement_definition',
      key: 'id_achievement_definition'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  progress_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  progress_denominator: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  unlocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  unlocked_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_source_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  last_source_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'user_achievement',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['id_user_profile', 'id_achievement_definition'],
      unique: true,
      name: 'uniq_user_achievement_definition'
    },
    {
      fields: ['id_user_profile', 'unlocked', 'updated_at'],
      name: 'idx_user_achievement_user_status'
    }
  ]
});

module.exports = UserAchievement;

