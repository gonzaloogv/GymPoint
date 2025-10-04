const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo AdminProfile - Perfil de Administrador
 * 
 * Datos de administradores del sistema.
 * Separado de Account (autenticación) y de UserProfile.
 * 
 * Relaciones:
 * - 1:1 con Account
 */
const AdminProfile = sequelize.define('AdminProfile', {
  id_admin_profile: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'accounts',
      key: 'id_account'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Relación 1:1 con account'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Departamento (IT, Support, Management, etc.)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas internas sobre el admin'
  }
}, {
  tableName: 'admin_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_account']
    }
  ]
});

module.exports = AdminProfile;

