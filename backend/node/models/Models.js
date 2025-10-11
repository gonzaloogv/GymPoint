const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Media = sequelize.define('Media', {
  id_media: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  entity_type: {
    type: DataTypes.ENUM('USER_PROFILE', 'GYM', 'EXERCISE', 'PROGRESS'),
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  media_type: {
    type: DataTypes.ENUM('IMAGE', 'VIDEO'),
    allowNull: false,
    defaultValue: 'IMAGE'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  display_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'media',
  timestamps: false
});
module.exports = Media;