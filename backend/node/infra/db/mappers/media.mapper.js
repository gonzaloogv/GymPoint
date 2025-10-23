/**
 * Media DB Mapper
 * Transforma instancias de Sequelize a POJOs
 */

const { toPlain } = require('./utils');

function toMedia(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_media: plain.id_media,
    entity_type: plain.entity_type,
    entity_id: plain.entity_id,
    media_type: plain.media_type,
    url: plain.url,
    thumbnail_url: plain.thumbnail_url,
    file_size: plain.file_size,
    mime_type: plain.mime_type,
    width: plain.width,
    height: plain.height,
    is_primary: plain.is_primary,
    display_order: plain.display_order,
    uploaded_at: plain.uploaded_at
  };
}

function toMediaList(instances) {
  if (!instances || !Array.isArray(instances)) return [];
  return instances.map(toMedia).filter(Boolean);
}

module.exports = {
  toMedia,
  toMediaList
};
