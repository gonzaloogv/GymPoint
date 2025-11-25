const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserImportedRoutine = sequelize.define('UserImportedRoutine', {
  id_import: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
  id_template_routine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'routine',
      key: 'id_routine'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  id_user_routine: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'routine',
      key: 'id_routine'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Copia de la rutina para el usuario'
  },
  imported_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_imported_routine',
  timestamps: false,
  indexes: [
    {
      fields: ['id_user_profile'],
      name: 'idx_imported_routine_user'
    }
  ]
});

module.exports = UserImportedRoutine;

