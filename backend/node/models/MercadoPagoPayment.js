const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MercadoPagoPayment = sequelize.define('MercadoPagoPayment', {
  id_mp_payment: {
    type: DataTypes.INTEGER,
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
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'gym',
      key: 'id_gym'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Gimnasio si el pago es por suscripción'
  },
  payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: 'ID del pago en MercadoPago'
  },
  preference_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID de la preferencia de pago'
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'ARS',
    comment: 'Código de moneda (ISO 4217)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  subscription_type: {
    type: DataTypes.ENUM('MONTHLY', 'WEEKLY', 'DAILY', 'ANNUAL'),
    allowNull: true
  },
  payment_method_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payment_type_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payer_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  external_reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Referencia externa del negocio'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Información adicional del pago'
  }
}, {
  tableName: 'mercadopago_payment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['payment_id'],
      name: 'idx_mp_payment_id'
    },
    {
      fields: ['preference_id'],
      name: 'idx_mp_preference_id'
    },
    {
      fields: ['status'],
      name: 'idx_mp_status'
    },
    {
      fields: ['id_user_profile', 'id_gym'],
      name: 'idx_mp_user_gym'
    }
  ]
});

module.exports = MercadoPagoPayment;


