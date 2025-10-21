const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymSpecialSchedule = sequelize.define('GymSpecialSchedule', {
  id_special_schedule: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Referencia al gimnasio'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha específica (feriados, eventos especiales)'
  },
  open_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Hora de apertura especial'
  },
  close_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Hora de cierre especial'
  },
  is_closed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si está cerrado ese día'
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Razón del horario especial'
  }
}, {
  tableName: 'gym_special_schedule',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_gym', 'date'],
      name: 'idx_gym_special_schedule_gym_date'
    }
  ]
});

module.exports = GymSpecialSchedule;

// Las asociaciones se definen en index.js para evitar referencias circulares
