const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Media = sequelize.define('Media', {
  id_media: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entity_type: {
    type: DataTypes.ENUM('USER_PROFILE', 'GYM', 'EXERCISE', 'PROGRESS', 'REVIEW'),
    allowNull: false,
    comment: 'Tipo de entidad a la que pertenece'
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
    allowNull: true,
    comment: 'Tamaño del archivo en bytes'
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
  timestamps: false,
  indexes: [
    {
      fields: ['entity_type', 'entity_id'],
      name: 'idx_media_entity'
    },
    {
      fields: ['entity_type', 'entity_id', 'is_primary'],
      name: 'idx_media_primary'
    }
  ]
});

module.exports = Media;