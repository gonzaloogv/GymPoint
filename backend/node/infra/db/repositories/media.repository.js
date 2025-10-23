/**
 * Media Repository
 * Gestión de archivos multimedia (imágenes y videos)
 */

const { Media } = require('../../../models');
const { Op } = require('sequelize');

/**
 * Crear registro de media
 */
async function create(data, options = {}) {
  const { transaction } = options;

  return await Media.create({
    entity_type: data.entityType,
    entity_id: data.entityId,
    media_type: data.mediaType || 'IMAGE',
    url: data.url,
    thumbnail_url: data.thumbnailUrl || null,
    file_size: data.fileSize || null,
    mime_type: data.mimeType || null,
    width: data.width || null,
    height: data.height || null,
    is_primary: data.isPrimary || false,
    display_order: data.displayOrder || 0
  }, { transaction });
}

/**
 * Buscar media por ID
 */
async function findById(idMedia) {
  return await Media.findByPk(idMedia);
}

/**
 * Listar media por entidad
 */
async function findByEntity(entityType, entityId, options = {}) {
  const { mediaType } = options;

  const whereClause = {
    entity_type: entityType,
    entity_id: entityId
  };

  if (mediaType) {
    whereClause.media_type = mediaType;
  }

  return await Media.findAll({
    where: whereClause,
    order: [
      ['is_primary', 'DESC'],
      ['display_order', 'ASC'],
      ['uploaded_at', 'DESC']
    ]
  });
}

/**
 * Marcar todas las medias de una entidad como no primarias (excepto una)
 */
async function unsetPrimaryForEntity(entityType, entityId, exceptIdMedia, options = {}) {
  const { transaction } = options;

  const whereClause = {
    entity_type: entityType,
    entity_id: entityId
  };

  if (exceptIdMedia) {
    whereClause.id_media = { [Op.ne]: exceptIdMedia };
  }

  await Media.update(
    { is_primary: false },
    { where: whereClause, transaction }
  );
}

/**
 * Actualizar media
 */
async function update(idMedia, data, options = {}) {
  const { transaction } = options;

  const media = await Media.findByPk(idMedia, { transaction });
  if (!media) return null;

  await media.update({
    url: data.url !== undefined ? data.url : media.url,
    thumbnail_url: data.thumbnailUrl !== undefined ? data.thumbnailUrl : media.thumbnail_url,
    file_size: data.fileSize !== undefined ? data.fileSize : media.file_size,
    mime_type: data.mimeType !== undefined ? data.mimeType : media.mime_type,
    width: data.width !== undefined ? data.width : media.width,
    height: data.height !== undefined ? data.height : media.height,
    is_primary: data.isPrimary !== undefined ? data.isPrimary : media.is_primary,
    display_order: data.displayOrder !== undefined ? data.displayOrder : media.display_order
  }, { transaction });

  await media.reload({ transaction });
  return media;
}

/**
 * Eliminar media
 */
async function deleteById(idMedia, options = {}) {
  const { transaction } = options;

  const media = await Media.findByPk(idMedia, { transaction });
  if (!media) return false;

  await media.destroy({ transaction });
  return true;
}

module.exports = {
  create,
  findById,
  findByEntity,
  unsetPrimaryForEntity,
  update,
  deleteById
};
