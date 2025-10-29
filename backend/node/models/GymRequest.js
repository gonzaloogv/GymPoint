const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GymRequest = sequelize.define('GymRequest', {
  id_gym_request: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // Información básica
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del gimnasio'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción del gimnasio'
  },

  // Ubicación
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Ciudad'
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Dirección física'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Latitud geográfica'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'Longitud geográfica'
  },

  // Contacto
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Teléfono de contacto'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email de contacto'
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Sitio web'
  },

  // Redes sociales
  instagram: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Usuario de Instagram'
  },
  facebook: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Página de Facebook'
  },

  // Fotos
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'URLs de fotos del gimnasio'
  },

  // Equipment categorizado por tipo
  equipment: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Equipamiento categorizado: { "fuerza": [{ "name": "Banco press", "quantity": 4 }], "cardio": [...] }'
  },

  // Services / Tipos de entrenamiento
  services: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Servicios/tipos ofrecidos: ["Funcional", "CrossFit", "Musculación"]'
  },

  // Reglas del gimnasio
  rules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Reglas del gimnasio'
  },

  // Precios
  monthly_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'Precio mensual'
  },
  weekly_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'Precio semanal'
  },
  daily_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'Precio diario'
  },

  // Horarios
  schedule: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Horarios de atención por día'
  },

  // Amenidades (servicios)
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Amenidades y servicios del gimnasio'
  },

  // Estado de la solicitud
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Estado de la solicitud'
  },

  // Razón de rechazo (si aplica)
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Razón por la cual se rechazó la solicitud'
  },

  // ID del gimnasio creado (si fue aprobado)
  id_gym: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del gimnasio creado tras aprobación'
  },

  // Admin que procesó la solicitud
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del admin que procesó la solicitud'
  },

  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de procesamiento'
  }
}, {
  tableName: 'gym_request',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['status'],
      name: 'idx_gym_request_status'
    },
    {
      fields: ['city'],
      name: 'idx_gym_request_city'
    },
    {
      fields: ['created_at'],
      name: 'idx_gym_request_created'
    }
  ]
});

module.exports = GymRequest;
