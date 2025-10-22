const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Routine = sequelize.define('Routine', {
  id_routine: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre de la rutina'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción de la rutina'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'user_profiles',
      key: 'id_user_profile'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Usuario creador (NULL = rutina del sistema)'
  },
  is_template: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si es una rutina template predefinida'
  },
  classification: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Clasificación de la rutina'
  },
  recommended_for: {
    type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    allowNull: true,
    comment: 'Nivel recomendado'
  },
  template_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Orden de visualización en templates'
  }
}, {
  tableName: 'routine',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['is_template', 'template_order'],
      name: 'idx_routine_template'
    },
    {
      fields: ['created_by'],
      name: 'idx_routine_created_by'
    },
    {
      fields: ['deleted_at'],
      name: 'idx_routine_deleted'
    }
  ]
});

module.exports = Routine;

// Las asociaciones se definen en index.js para evitar referencias circulares
