const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActiveUserEffect = sequelize.define('ActiveUserEffect', {
  id_effect: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user_profiles',
      key: 'id_user_profile',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  effect_type: {
    type: DataTypes.ENUM('token_multiplier'),
    allowNull: false,
  },
  multiplier_value: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_consumed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'active_user_effects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      name: 'idx_active_effects_user_expires',
      fields: ['id_user_profile', 'expires_at', 'is_consumed'],
    },
    {
      name: 'idx_active_effects_type',
      fields: ['effect_type'],
    },
  ],
});

module.exports = ActiveUserEffect;
