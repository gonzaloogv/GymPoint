const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Token Ledger - Registro completo de movimientos de tokens
 * Implementa el patrón Ledger según CLAUDE.md
 */
const TokenLedger = sequelize.define('TokenLedger', {
  id_ledger: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Usuario asociado al movimiento'
  },
  delta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Positivo=ganancia, negativo=gasto'
  },
  reason: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'ATTENDANCE, ROUTINE_COMPLETE, REWARD_CLAIM, WEEKLY_BONUS, etc.'
  },
  ref_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'assistance, claimed_reward, routine, etc.'
  },
  ref_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'ID del registro relacionado'
  },
  balance_after: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Balance después de aplicar delta'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'token_ledger',
  timestamps: false,
  indexes: [
    {
      fields: ['id_user_profile', 'created_at'],
      name: 'idx_ledger_user_date'
    },
    {
      fields: ['ref_type', 'ref_id'],
      name: 'idx_ledger_ref'
    },
    {
      fields: ['reason'],
      name: 'idx_ledger_reason'
    }
  ]
});

module.exports = TokenLedger;

