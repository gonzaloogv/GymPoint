const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assistance = sequelize.define('Assistance', {
  id_assistance: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  // @deprecated - Usar check_in_time en su lugar. Campo mantenido temporalmente por compatibilidad
  hour: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'DEPRECATED: Usar check_in_time. Se eliminará en futuras versiones'
  },
  check_in_time: {
    type: DataTypes.TIME,
    allowNull: false,  // Ahora es NOT NULL después de la migración
    comment: 'Hora de check-in (campo principal, reemplaza a hour)'
  },
  check_out_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  distance_meters: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  auto_checkin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_streak: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'assistance',
  timestamps: false
});

module.exports = Assistance;

// Las asociaciones se definen en index.js para evitar referencias circulares
