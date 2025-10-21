const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccountDeletionRequest = sequelize.define('AccountDeletionRequest', {
  id_deletion_request: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único de la solicitud'
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id_account'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Cuenta que solicita eliminación'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón de la eliminación (opcional)'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Estado de la solicitud'
  },
  requested_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de solicitud'
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de procesamiento'
  },
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'admin_profiles',
      key: 'id_admin_profile'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Admin que procesó la solicitud'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas del administrador'
  }
}, {
  tableName: 'account_deletion_request',
  timestamps: false,
  indexes: [
    {
      fields: ['id_account', 'status'],
      name: 'idx_deletion_request_account_status'
    },
    {
      fields: ['status', 'requested_at'],
      name: 'idx_deletion_request_status_date'
    }
  ]
});

module.exports = AccountDeletionRequest;
