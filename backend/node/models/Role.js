const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Role - Catálogo de Roles
 * 
 * Define los roles disponibles en el sistema (USER, ADMIN, etc.).
 * 
 * Relaciones:
 * - 1:N con AccountRole
 */
const Role = sequelize.define('Role', {
  id_role: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Nombre del rol (USER, ADMIN, etc.)'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Descripción del rol'
  }
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['role_name']
    }
  ]
});

// Constantes de roles
Role.ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

module.exports = Role;

