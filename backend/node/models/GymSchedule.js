const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymSchedule = sequelize.define('GymSchedule', {
  id_schedule: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gym',
      key: 'id_gym'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Referencia al gimnasio'
  },
  day_of_week: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '0=Domingo, 1=Lunes, ..., 6=Sábado'
  },
  open_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de apertura'
  },
  close_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de cierre'
  },
  is_closed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si está cerrado ese día'
  }
}, {
  tableName: 'gym_schedule',
  timestamps: false,
  indexes: [
    {
      fields: ['id_gym', 'day_of_week'],
      name: 'idx_gym_schedule_gym_day'
    }
  ]
});

module.exports = GymSchedule;

// Las asociaciones se definen en index.js para evitar referencias circulares
