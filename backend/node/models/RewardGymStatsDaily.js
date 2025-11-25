const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo RewardGymStatsDaily - Estadísticas diarias de recompensas por gimnasio
 *
 * Registra métricas agregadas de recompensas canjeadas por día y por gimnasio
 * Útil para análisis y reportes de actividad de recompensas
 */
const RewardGymStatsDaily = sequelize.define('RewardGymStatsDaily', {
  id_stat: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gym',
      key: 'id_gym'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  day: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Día de las estadísticas'
  },
  total_rewards_claimed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total de recompensas canjeadas en el día'
  },
  total_tokens_spent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total de tokens gastados en el día'
  },
  unique_users: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Usuarios únicos que canjearon recompensas'
  }
}, {
  tableName: 'reward_gym_stats_daily',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['id_gym', 'day'],
      name: 'uniq_reward_stats_gym_day'
    },
    {
      fields: ['day'],
      name: 'idx_reward_stats_day'
    }
  ]
});

module.exports = RewardGymStatsDaily;
