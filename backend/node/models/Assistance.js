const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assistance = sequelize.define('Assistance', {
  id_assistance: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Referencia al perfil de usuario'
  },
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Gimnasio donde se realizó la asistencia'
  },
  id_streak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Racha asociada a esta asistencia'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha de la asistencia'
  },
  check_in_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora de entrada'
  },
  check_out_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Hora de salida'
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duración en minutos'
  },
  auto_checkin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si fue auto check-in por geofence'
  },
  distance_meters: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'Distancia en metros al momento del check-in'
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si la asistencia fue verificada'
  }
}, {
  tableName: 'assistance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['id_user_profile', 'date'],
      name: 'idx_assistance_user_date'
    },
    {
      fields: ['id_gym', 'date'],
      name: 'idx_assistance_gym_date'
    },
    {
      fields: ['auto_checkin', 'date'],
      name: 'idx_assistance_auto_date'
    },
    {
      fields: ['duration_minutes'],
      name: 'idx_assistance_duration'
    }
  ]
});

module.exports = Assistance;

// Las asociaciones se definen en index.js para evitar referencias circulares
