const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MercadoPagoPayment = sequelize.define('MercadoPagoPayment', {
  id_mp_payment: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subscription_type: {
    type: DataTypes.ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL'),
    allowNull: false,
    defaultValue: 'MONTHLY'
  },
  auto_renew: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'ARS'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  preference_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  merchant_order_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  external_reference: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true
  },
  status: {
    type: DataTypes.ENUM(
      'PENDING',
      'APPROVED',
      'AUTHORIZED',
      'IN_PROCESS',
      'IN_MEDIATION',
      'REJECTED',
      'CANCELLED',
      'REFUNDED',
      'CHARGED_BACK'
    ),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  status_detail: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payment_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  webhook_received_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payer_email: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  raw_response: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'mercadopago_payment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MercadoPagoPayment;


