const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Presence = sequelize.define('Presence', {
  id_presence: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  
  // Usuario y gimnasio (CORREGIR nombre de columna)
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
  
  // Timestamps (coincide con SQL)
  first_seen_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Primera detección en geofence'
  },
  last_seen_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Última actualización de ubicación'
  },
  exited_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Cuándo salió del geofence'
  },
  
  // Status (coincide con SQL)
  status: {
    type: DataTypes.ENUM('DETECTING', 'CONFIRMED', 'EXITED'),
    allowNull: false,
    defaultValue: 'DETECTING',
    comment: 'DETECTING: detectando, CONFIRMED: check-in hecho, EXITED: salió'
  },
  
  // Conversión a assistance
  converted_to_assistance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  id_assistance: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'assistance',
      key: 'id_assistance'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  
  // Metadata
  distance_meters: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  accuracy_meters: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  location_updates_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'presence',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      fields: ['id_user_profile', 'id_gym'],
      name: 'idx_presence_user_gym'
    },
    {
      fields: ['status'],
      name: 'idx_presence_status'
    },
    {
      fields: ['id_assistance'],
      name: 'idx_presence_assistance'
    }
  ]
});

module.exports = Presence;