const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccountDeletionRequest = sequelize.define('AccountDeletionRequest', {
  id_request: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_deletion_request',
    comment: 'ID unico de la solicitud'
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
    comment: 'Cuenta que solicita eliminacion'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razon de la eliminacion (opcional)'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
    comment: 'Estado de la solicitud'
  },
  scheduled_deletion_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha programada para completar la eliminacion'
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
    comment: 'Admin que proceso la solicitud'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de cancelacion (self-service)'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que la eliminacion se completo'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales de la solicitud'
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
