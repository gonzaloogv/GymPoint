const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccountDeletionRequest = sequelize.define('AccountDeletionRequest', {
  id_request: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scheduled_deletion_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CANCELLED', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  requested_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'account_deletion_request',
  timestamps: false,
  indexes: [
    {
      fields: ['status', 'scheduled_deletion_date'],
      name: 'idx_account_deletion_status_date'
    }
  ]
});

module.exports = AccountDeletionRequest;
