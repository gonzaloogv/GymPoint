const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo alineado con el esquema real de la tabla account_deletion_request
const AccountDeletionRequest = sequelize.define('AccountDeletionRequest', {
  id_request: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  scheduled_deletion_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha programada para eliminar la cuenta'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CANCELLED', 'COMPLETED'),
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
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de cancelacion'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de completado'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales de la solicitud'
  }
}, {
  tableName: 'account_deletion_request',
  timestamps: false,
  indexes: [
    {
      fields: ['id_account'],
      name: 'idx_account_deletion_account'
    },
    {
      fields: ['status', 'scheduled_deletion_date'],
      name: 'idx_account_deletion_status_date'
    }
  ]
});

module.exports = AccountDeletionRequest;
