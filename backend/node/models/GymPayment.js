const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymPayment = sequelize.define('GymPayment', {
  id_payment: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    allowNull: false,
    references: {
      model: 'gym',
      key: 'id_gym'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  period_start: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Inicio del período pagado'
  },
  period_end: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fin del período pagado'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'gym_payment',
  timestamps: false,
  indexes: [
    {
      fields: ['id_user_profile', 'id_gym'],
      name: 'idx_gym_payment_user_gym'
    },
    {
      fields: ['payment_date', 'status'],
      name: 'idx_gym_payment_date_status'
    }
  ]
});

module.exports = GymPayment;

// Asociaciones definidas en models/index.js
