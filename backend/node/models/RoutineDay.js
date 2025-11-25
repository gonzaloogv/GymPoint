const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoutineDay = sequelize.define('RoutineDay', {
  id_routine_day: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_routine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'routine',
      key: 'id_routine'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  day_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número del día en la rutina (1, 2, 3...)'
  },
  day_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nombre del día (ej: "Pecho y Tríceps")'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rest_day: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'routine_day',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_routine', 'day_number'],
      name: 'uniq_routine_day_number'
    },
    {
      fields: ['id_routine'],
      name: 'idx_routine_day_routine'
    }
  ]
});

module.exports = RoutineDay;
