const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo AccountRole - Tabla de unión para RBAC
 * 
 * Relaciona Accounts con Roles (many-to-many).
 * Permite que un usuario tenga múltiples roles.
 * 
 * Relaciones:
 * - N:1 con Account
 * - N:1 con Role
 */
const AccountRole = sequelize.define('AccountRole', {
  id_account_role: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_account: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id_account'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  id_role: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id_role'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'account_roles',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_account', 'id_role'],
      name: 'unique_account_role'
    },
    {
      fields: ['id_account']
    },
    {
      fields: ['id_role']
    }
  ]
});

module.exports = AccountRole;

