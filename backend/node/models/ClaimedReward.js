const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClaimedReward = sequelize.define('ClaimedReward', {
  id_claimed_reward: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Referencia al perfil de usuario'
  },
  id_reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Referencia a la recompensa'
  },
  id_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Código de recompensa usado (si aplica)'
  },
  claimed_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha en que se reclamó'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'USED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Estado de la recompensa reclamada'
  },
  tokens_spent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tokens gastados en esta recompensa'
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Cuándo se usó/canjeó la recompensa'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora de expiración de la recompensa'
  }
}, {
  tableName: 'claimed_reward',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['id_user_profile', 'claimed_date'],
      name: 'idx_claimed_reward_user_date'
    },
    {
      fields: ['status'],
      name: 'idx_claimed_reward_status'
    },
    {
      fields: ['expires_at', 'status'],
      name: 'idx_claimed_reward_expires'
    }
  ]
});

// Instance methods
ClaimedReward.prototype.isExpired = function() {
  if (!this.expires_at) return false;
  return new Date() > new Date(this.expires_at);
};

ClaimedReward.prototype.isUsable = function() {
  return (this.status === 'PENDING' || this.status === 'ACTIVE') && !this.isExpired();
};

ClaimedReward.prototype.daysUntilExpiration = function() {
  if (!this.expires_at) return null;
  const now = new Date();
  const expiresAt = new Date(this.expires_at);
  const diffTime = expiresAt - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

module.exports = ClaimedReward;

// Las asociaciones se definen en index.js para evitar referencias circulares

