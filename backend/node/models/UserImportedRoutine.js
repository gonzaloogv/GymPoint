const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserImportedRoutine = sequelize.define('UserImportedRoutine', {
  id_import: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user_profile: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_routine_original: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_routine_copy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imported_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_imported_routine',
  timestamps: false
});

module.exports = UserImportedRoutine;

