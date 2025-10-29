const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gym = sequelize.define('Gym', {
  id_gym: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del gimnasio'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción del gimnasio'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Ciudad'
  },
  address: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Dirección física'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    comment: 'Latitud geográfica'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    comment: 'Longitud geográfica'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Teléfono de contacto'
  },
  whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número de WhatsApp'
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
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del logo del gimnasio'
  },
  social_media: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Redes sociales (JSON)'
  },
  equipment: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Equipamiento categorizado: { "fuerza": [{ "name": "Banco press", "quantity": 4 }], "cardio": [...] }'
  },
  services: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de servicios/tipos del gimnasio: ["Funcional", "CrossFit", "Musculación"]'
  },
  instagram: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  facebook: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  google_maps_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  max_capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  area_sqm: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  month_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'Precio mensual'
  },
  week_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'Precio semanal'
  },
  registration_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de registro del gimnasio'
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la foto principal del gimnasio'
  },
  rules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: '[]',
    comment: 'Reglas de convivencia del gimnasio'
  },
  auto_checkin_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Auto check-in habilitado'
  },  
  geofence_radius_meters: {
    type: DataTypes.INTEGER,
    allowNull: false, // âœ… CORREGIDO
    defaultValue: 150, // âœ… CORREGIDO: 150m por defecto
    comment: 'Radio de geofence en metros'
  },
  min_stay_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false, // âœ… CORREGIDO
    defaultValue: 10, // âœ… CORREGIDO: 10 min por defecto
    comment: 'Tiempo mi­nimo de estadi­a en minutos'
  },
  trial_allowed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si el gimnasio permite visitas de prueba sin suscripción'
  },
}, {
  tableName: 'gym',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['city'],
      name: 'idx_gym_city'
    },
    {
      fields: ['verified', 'featured'],
      name: 'idx_gym_verified_featured'
    },
    {
      fields: ['latitude', 'longitude'],
      name: 'idx_gym_location'
    },
    {
      fields: ['deleted_at'],
      name: 'idx_gym_deleted'
    },
    {
      fields: ['instagram'],
      name: 'idx_gym_instagram'
    }
  ]
});

module.exports = Gym;

// Las asociaciones se definen en index.js para evitar referencias circulares
