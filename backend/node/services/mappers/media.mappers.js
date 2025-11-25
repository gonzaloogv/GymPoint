/**
 * Media Service Mappers
 * Transformaciones entre DTOs, Commands/Queries y Entities
 */

// ==================== Request → Command/Query ====================

function toCreateMediaCommand(dto) {
  return {
    entityType: dto.entity_type || dto.entityType,
    entityId: dto.entity_id || dto.entityId,
    mediaType: dto.media_type || dto.mediaType || 'IMAGE',
    url: dto.url,
    thumbnailUrl: dto.thumbnail_url || dto.thumbnailUrl || null,
    fileSize: dto.file_size || dto.fileSize || null,
    mimeType: dto.mime_type || dto.mimeType || null,
    width: dto.width || null,
    height: dto.height || null,
    isPrimary: dto.is_primary !== undefined ? dto.is_primary : (dto.isPrimary || false),
    displayOrder: dto.display_order !== undefined ? dto.display_order : (dto.displayOrder || 0)
  };
}

function toUpdateMediaCommand(dto, idMedia) {
  return {
    idMedia: idMedia || dto.id_media || dto.idMedia,
    url: dto.url,
    thumbnailUrl: dto.thumbnail_url || dto.thumbnailUrl,
    fileSize: dto.file_size || dto.fileSize,
    mimeType: dto.mime_type || dto.mimeType,
    width: dto.width,
    height: dto.height,
    isPrimary: dto.is_primary !== undefined ? dto.is_primary : dto.isPrimary,
    displayOrder: dto.display_order !== undefined ? dto.display_order : dto.displayOrder
  };
}

function toSetPrimaryMediaCommand(idMedia) {
  return { idMedia };
}

function toDeleteMediaCommand(idMedia) {
  return { idMedia };
}

function toGetMediaByIdQuery(idMedia) {
  return { idMedia };
}

function toListMediaByEntityQuery(dto) {
  return {
    entityType: dto.entity_type || dto.entityType,
    entityId: dto.entity_id || dto.entityId,
    mediaType: dto.media_type || dto.mediaType
  };
}

// ==================== Entity → Response ====================

function toMediaResponse(media) {
  if (!media) return null;

  return {
    id_media: media.id_media,
    entity_type: media.entity_type,
    entity_id: media.entity_id,
    media_type: media.media_type,
    url: media.url,
    thumbnail_url: media.thumbnail_url,
    file_size: media.file_size,
    mime_type: media.mime_type,
    width: media.width,
    height: media.height,
    is_primary: media.is_primary,
    display_order: media.display_order,
    uploaded_at: media.uploaded_at
  };
}

function toMediaListResponse(mediaList) {
  if (!mediaList || !Array.isArray(mediaList)) return [];
  return mediaList.map(toMediaResponse).filter(Boolean);
}

module.exports = {
  // Request → Command/Query
  toCreateMediaCommand,
  toUpdateMediaCommand,
  toSetPrimaryMediaCommand,
  toDeleteMediaCommand,
  toGetMediaByIdQuery,
  toListMediaByEntityQuery,

  // Entity → Response
  toMediaResponse,
  toMediaListResponse
};
